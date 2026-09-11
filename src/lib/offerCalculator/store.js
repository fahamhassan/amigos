import crypto from "node:crypto";
import { sql } from "@/lib/db";
import { calculateOfferPrice } from "@/lib/offerCalculator/pricing";

function hashCode(code, sessionId) {
  return crypto.createHash("sha256").update(`${sessionId}:${code}:${process.env.SESSION_SECRET || "amigos"}`).digest("hex");
}

function projectTitle(project) {
  const property = project.propertyType || "Project";
  const service = Array.isArray(project.services) && project.services.length ? project.services[0] : "painting";

  return `Online ${service.replaceAll("_", " ")} request - ${property}`;
}

function serviceSummary(project) {
  return Array.isArray(project.services) && project.services.length
    ? project.services.map((service) => service.replaceAll("_", " ")).join(", ")
    : "Online request";
}

function customerFullName(info) {
  return `${info.firstName || ""} ${info.lastName || ""}`.trim() || "Online visitor";
}

export function createVerificationCode() {
  return String(crypto.randomInt(1000, 10000));
}

export async function createOrUpdateCalculation(project, options = {}) {
  const price = calculateOfferPrice(project, options);
  const id = crypto.randomUUID();

  const [session] = await sql`
    insert into offer_calculator_sessions (
      id, mode, status, property_type, room_type, components, services, quantities,
      project_notes, estimated_min_cents, estimated_max_cents, currency
    )
    values (
      ${id}, ${project.mode}, ${"CALCULATED"}, ${project.propertyType}, ${project.roomType || null},
      ${sql.json(project.components)}, ${sql.json(project.services)}, ${sql.json(project.quantities)},
      ${project.projectNotes || null}, ${price.minCents}, ${price.maxCents}, ${price.currency}
    )
    returning id, status, currency
  `;

  return {
    sessionId: session.id,
    status: session.status,
    currency: session.currency,
    lockedPrice: true
  };
}

export async function attachVerificationCode({ sessionId, email, code }) {
  const [session] = await sql`
    update offer_calculator_sessions
    set email = ${email},
      verification_code_hash = ${hashCode(code, sessionId)},
      verification_expires_at = now() + interval '15 minutes',
      verification_attempts = 0,
      status = 'VERIFYING',
      updated_at = now()
    where id = ${sessionId}
    returning id, email, property_type as "propertyType", room_type as "roomType", components, services,
      quantities, project_notes as "projectNotes", estimated_min_cents as "minCents",
      estimated_max_cents as "maxCents", currency, consultation_id as "consultationId", project_id as "projectId"
  `;

  if (session && !session.projectId) {
    await createProvisionalCrmLead(session);
  }

  return session;
}

async function createProvisionalCrmLead(session) {
  const service = serviceSummary(session);
  const title = projectTitle(session);
  const message = [
    "New Online Request from Offer Calculator.",
    "Customer reached e-mail verification. Full contact details may still be pending.",
    session.projectNotes ? `Notes: ${session.projectNotes}` : "",
    `Property type: ${session.propertyType}`,
    session.roomType ? `Room type: ${session.roomType}` : "",
    `Components: ${(session.components || []).join(", ")}`,
    `Services: ${(session.services || []).join(", ")}`,
    `Quantities: ${JSON.stringify(session.quantities || {})}`
  ].filter(Boolean).join("\n");

  const leadSource = session.projectNotes?.includes("Quick Estimate") ? "QUICK_QUOTE" : "DETAILED_QUOTE";

  const [consultation] = await sql`
    insert into consultations (id, name, email, project_type, message, source, metadata)
    values (
      ${crypto.randomUUID()}, ${"Online visitor"}, ${session.email}, ${"Online Request"},
      ${message}, ${leadSource},
      ${sql.json({ calculatorSessionId: session.id, source: leadSource, provisional: true })}
    )
    returning id
  `;

  const [project] = await sql`
    insert into projects (
      id, consultation_id, title, service, stage, priority,
      estimated_value_cents, estimated_min_cents, estimated_max_cents, currency,
      source, workflow, metadata
    )
    values (
      ${crypto.randomUUID()}, ${consultation.id}, ${title}, ${service}, ${"NEW_LEAD"}, ${"NORMAL"},
      ${session.maxCents}, ${session.minCents}, ${session.maxCents}, ${session.currency},
      ${leadSource}, ${"Review"},
      ${sql.json({
        calculatorSessionId: session.id,
        source: leadSource,
        provisional: true,
        components: session.components,
        services: session.services,
        quantities: session.quantities,
        estimate: { minCents: session.minCents, maxCents: session.maxCents, currency: session.currency }
      })}
    )
    returning id
  `;

  await sql`
    update offer_calculator_sessions
    set consultation_id = ${consultation.id}, project_id = ${project.id}, updated_at = now()
    where id = ${session.id}
  `;

  await sql`
    insert into crm_tasks (id, project_id, title, status)
    values (${crypto.randomUUID()}, ${project.id}, ${"Review online calculator lead"}, ${"OPEN"})
  `;
}

export async function verifySessionCode({ sessionId, code }) {
  const [session] = await sql`
    select id, verification_code_hash as "codeHash", verification_expires_at as "expiresAt",
      verification_attempts as "attempts", estimated_min_cents as "minCents",
      estimated_max_cents as "maxCents", currency, email
    from offer_calculator_sessions
    where id = ${sessionId}
  `;

  if (!session) return { error: "Calculation session not found." };
  if (session.attempts >= 5) return { error: "Too many attempts. Please resend a new code." };
  if (!session.expiresAt || new Date(session.expiresAt).getTime() < Date.now()) return { error: "This code expired. Please resend it." };

  const matches = session.codeHash === hashCode(code, sessionId);

  if (!matches) {
    await sql`
      update offer_calculator_sessions
      set verification_attempts = verification_attempts + 1, updated_at = now()
      where id = ${sessionId}
    `;

    return { error: "The verification code is not correct." };
  }

  const [verified] = await sql`
    update offer_calculator_sessions
    set email_verified_at = now(), status = 'PRICE_UNLOCKED', updated_at = now()
    where id = ${sessionId}
    returning id, email, estimated_min_cents as "minCents", estimated_max_cents as "maxCents", currency
  `;

  return { session: verified };
}

export async function getVerifiedSession(sessionId) {
  const [session] = await sql`
    select id, mode, status, email, email_verified_at as "emailVerifiedAt",
      property_type as "propertyType", room_type as "roomType", components, services, quantities,
      project_notes as "projectNotes", estimated_min_cents as "minCents",
      estimated_max_cents as "maxCents", currency, project_id as "projectId"
    from offer_calculator_sessions
    where id = ${sessionId}
  `;

  if (!session || !session.emailVerifiedAt) return null;

  return session;
}

export async function addProjectPhoto({ sessionId, category, file }) {
  const [session] = await sql`select id from offer_calculator_sessions where id = ${sessionId}`;
  if (!session) return { error: "Calculation session not found." };

  const [photo] = await sql`
    insert into offer_calculator_photos (id, session_id, category, file_name, file_type, file_size, data_url)
    values (${crypto.randomUUID()}, ${sessionId}, ${category}, ${file.name}, ${file.type}, ${file.size}, ${file.dataUrl})
    returning id, category, file_name as "fileName"
  `;

  return { photo };
}

export async function submitOfferRequest({ sessionId, customerInfo }) {
  const session = await getVerifiedSession(sessionId);

  if (!session) return { error: "Please verify your e-mail before requesting an offer." };

  const name = customerFullName(customerInfo);
  const service = serviceSummary(session);
  const title = projectTitle(session);
  const message = [
    "New Online Request from Offer Calculator.",
    session.projectNotes ? `Notes: ${session.projectNotes}` : "",
    `Property type: ${session.propertyType}`,
    session.roomType ? `Room type: ${session.roomType}` : "",
    `Components: ${(session.components || []).join(", ")}`,
    `Services: ${(session.services || []).join(", ")}`,
    `Quantities: ${JSON.stringify(session.quantities || {})}`,
    `Requested action: ${customerInfo.requestedAction}`
  ].filter(Boolean).join("\n");

  const [property] = await sql`
    insert into properties (id, label, address, property_type)
    values (
      ${crypto.randomUUID()},
      ${customerInfo.company || `${name} Property`},
      ${`${customerInfo.address}, ${customerInfo.postalCode} ${customerInfo.city}`},
      ${session.propertyType}
    )
    returning id
  `;

  const workflow = customerInfo.requestedAction === "CONSULTATION" ? "Contact Customer" : "Review";
  const leadSource = session.projectNotes?.includes("Quick Estimate") ? "QUICK_QUOTE" : "DETAILED_QUOTE";
  let consultation = { id: session.consultationId };
  let project = { id: session.projectId };
  const metadata = {
    calculatorSessionId: session.id,
    source: leadSource,
    provisional: false,
    components: session.components,
    services: session.services,
    quantities: session.quantities,
    customerInfo,
    requestedAction: customerInfo.requestedAction,
    estimate: { minCents: session.minCents, maxCents: session.maxCents, currency: session.currency }
  };

  if (consultation.id) {
    [consultation] = await sql`
      update consultations
      set name = ${name}, email = ${customerInfo.email}, phone = ${customerInfo.phone},
        project_type = ${"Online Request"}, message = ${message}, source = ${leadSource}, metadata = ${sql.json(metadata)}, updated_at = now()
      where id = ${consultation.id}
      returning id
    `;
  } else {
    [consultation] = await sql`
      insert into consultations (id, name, email, phone, project_type, message, source, metadata)
      values (${crypto.randomUUID()}, ${name}, ${customerInfo.email}, ${customerInfo.phone}, ${"Online Request"},
        ${message}, ${leadSource}, ${sql.json(metadata)})
      returning id
    `;
  }

  if (project.id) {
    [project] = await sql`
      update projects
      set consultation_id = ${consultation.id}, property_id = ${property.id}, title = ${title}, service = ${service},
        estimated_value_cents = ${session.maxCents}, estimated_min_cents = ${session.minCents},
        estimated_max_cents = ${session.maxCents}, currency = ${session.currency}, workflow = ${workflow},
        source = ${leadSource}, metadata = ${sql.json(metadata)}, updated_at = now()
      where id = ${project.id}
      returning id
    `;
  } else {
    [project] = await sql`
      insert into projects (
        id, consultation_id, property_id, title, service, stage, priority,
        estimated_value_cents, estimated_min_cents, estimated_max_cents, currency,
        source, workflow, metadata
      )
      values (
        ${crypto.randomUUID()}, ${consultation.id}, ${property.id}, ${title}, ${service}, ${"NEW_LEAD"}, ${"NORMAL"},
        ${session.maxCents}, ${session.minCents}, ${session.maxCents}, ${session.currency},
        ${leadSource}, ${workflow}, ${sql.json(metadata)}
      )
      returning id
    `;
  }

  await sql`
    update offer_calculator_sessions
    set customer_info = ${sql.json(customerInfo)}, consultation_id = ${consultation.id}, project_id = ${project.id},
      requested_action = ${customerInfo.requestedAction}, status = 'REQUEST_SUBMITTED', updated_at = now()
    where id = ${sessionId}
  `;

  await sql`
    insert into crm_notes (id, project_id, author_type, body)
    values (${crypto.randomUUID()}, ${project.id}, ${"SYSTEM"}, ${"Online calculator request created. Review project data, contact the customer, then move through Inspection -> Final Offer -> Accepted -> Project -> Invoice."})
  `;

  await sql`
    insert into crm_tasks (id, project_id, title, status)
    values (${crypto.randomUUID()}, ${project.id}, ${"Review online request and contact customer"}, ${"OPEN"})
  `;

  if (customerInfo.requestedAction === "CONSULTATION") {
    await sql`
      insert into appointments (id, consultation_id, title, date, time, status)
      values (${crypto.randomUUID()}, ${consultation.id}, ${"Consultation: Online Request"}, ${"Pending"}, ${"Pending"}, ${"PENDING"})
    `;
  }

  return { projectId: project.id, consultationId: consultation.id };
}
