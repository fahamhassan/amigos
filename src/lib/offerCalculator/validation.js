import { cleanText, normalizeEmail } from "@/lib/validation";

export const PROPERTY_TYPES = new Set(["apartment", "house", "commercial", "facade", "room", "other"]);
export const COMPONENTS = new Set(["ceilings", "walls", "doors", "windows", "radiators", "baseboards", "railings", "stairs", "facade", "other"]);
export const SERVICES = new Set([
  "ceiling_paint_2_coats",
  "wall_paint_2_coats",
  "remove_wallpaper",
  "apply_wallpaper",
  "filling_spackling",
  "mold_treatment",
  "nicotine_treatment",
  "water_damage_repair",
  "priming_sealing",
  "covering_protection",
  "paint_doors",
  "paint_windows",
  "paint_radiators",
  "paint_baseboards",
  "railing_cleaning",
  "railing_sanding",
  "railing_priming",
  "paint_railings",
  "paint_stairs",
  "paint_other"
]);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const QUANTITY_KEYS = new Set(["wallArea", "ceilingArea", "doors", "windows", "radiators", "baseboards", "railingLength", "stairSteps", "facadeArea", "otherUnits"]);

function pickAllowed(values, allowed) {
  return [...new Set(Array.isArray(values) ? values.filter((value) => allowed.has(value)) : [])];
}

// Component-specific answers (spec §4/§6). Anything not on these lists is discarded so a
// crafted payload cannot reach the pricing engine.
const COMPONENT_DETAIL_CHOICES = {
  doorType: new Set(["standard", "double", "entrance", "other"]),
  doorMaterial: new Set(["wood", "metal", "unsure"]),
  doorSides: new Set(["one_side", "both_sides"]),
  doorFrame: new Set(["yes", "no"]),
  doorCondition: new Set(["good", "minor", "renovation"]),
  railingType: new Set(["balcony", "stair"]),
  railingMaterial: new Set(["metal", "wood"]),
  railingCondition: new Set(["good", "minor", "renovation"])
};

function normalizeComponentDetails(input) {
  const source = input && typeof input === "object" ? input : {};
  const details = {};

  for (const [key, allowed] of Object.entries(COMPONENT_DETAIL_CHOICES)) {
    if (allowed.has(source[key])) details[key] = source[key];
  }

  return details;
}

function normalizeQuantities(input) {
  const source = input && typeof input === "object" ? input : {};
  const quantities = {};

  for (const key of QUANTITY_KEYS) {
    const value = Number(source[key]);
    if (Number.isFinite(value) && value > 0) quantities[key] = Math.min(value, 10000);
  }

  return quantities;
}

export function validateCalculatorProject(input = {}) {
  const values = {
    mode: input.mode === "REQUEST" ? "REQUEST" : "CALCULATE",
    propertyType: PROPERTY_TYPES.has(input.propertyType) ? input.propertyType : "",
    roomType: cleanText(input.roomType || ""),
    components: pickAllowed(input.components, COMPONENTS),
    services: pickAllowed(input.services, SERVICES),
    quantities: normalizeQuantities(input.quantities),
    componentDetails: normalizeComponentDetails(input.componentDetails),
    projectNotes: String(input.projectNotes || "").trim().slice(0, 2500)
  };
  const errors = {};

  if (!values.propertyType) errors.propertyType = "Please select a property type.";
  if (!values.components.length) errors.components = "Please select at least one component.";
  if (!values.services.length) errors.services = "Please select at least one service.";

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    values
  };
}

export function validateEmailPayload(input = {}) {
  const email = normalizeEmail(input.email);
  const errors = {};

  if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid e-mail address.";

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    values: { email }
  };
}

export function validateCodePayload(input = {}) {
  const code = String(input.code || "").replace(/\D/g, "").slice(0, 4);
  const errors = {};

  if (code.length !== 4) errors.code = "Enter the 4-digit verification code.";

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    values: { code }
  };
}

export function validateCustomerInfo(input = {}) {
  const values = {
    firstName: cleanText(input.firstName),
    lastName: cleanText(input.lastName),
    phone: cleanText(input.phone),
    email: normalizeEmail(input.email),
    address: cleanText(input.address),
    postalCode: cleanText(input.postalCode),
    city: cleanText(input.city),
    company: cleanText(input.company),
    propertyManagement: Boolean(input.propertyManagement),
    requestedAction: input.requestedAction === "CONSULTATION" ? "CONSULTATION" : "OFFER"
  };
  const errors = {};

  if (values.firstName.length < 2) errors.firstName = "First name is required.";
  if (values.lastName.length < 2) errors.lastName = "Last name is required.";
  if (values.phone.length < 6) errors.phone = "Phone number is required.";
  if (!EMAIL_PATTERN.test(values.email)) errors.email = "Enter a valid e-mail address.";
  if (values.address.length < 3) errors.address = "Property address is required.";
  if (values.postalCode.length < 3) errors.postalCode = "Postal code is required.";
  if (values.city.length < 2) errors.city = "City is required.";

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    values
  };
}
