import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { getVerifiedSession } from "@/lib/offerCalculator/store";
import { sql } from "@/lib/db";

function formatChf(cents) {
  const chf = Math.round(cents / 100);
  return "CHF " + chf.toLocaleString("de-CH") + ".–";
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    const session = await getVerifiedSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not verified or not found" }, { status: 404 });
    }

    // Also fetch customer info if available
    const [row] = await sql`
      select customer_info as "customerInfo", created_at as "createdAt"
      from offer_calculator_sessions
      where id = ${sessionId}
    `;
    const customer = row?.customerInfo || {};

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const primaryColor = [20, 20, 20];
    const accentYellow = [232, 196, 68];
    const mutedColor = [100, 100, 100];
    const lightBg = [248, 248, 248];

    // Top Header Banner
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 36, "F");

    doc.setFillColor(...accentYellow);
    doc.rect(0, 36, 210, 3, "F");

    // Brand title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("AMIGOS MALER GMBH", 18, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(232, 196, 68);
    doc.text("KOMPETENZ VERBINDET • QUALITÄT FÜR GENERATIONEN", 18, 26);

    // Header Right
    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    doc.text("info@amigos-maler.ch", 192, 16, { align: "right" });
    doc.text("www.amigos-maler.ch", 192, 22, { align: "right" });
    doc.text("Schweiz", 192, 28, { align: "right" });

    // Document Title
    let y = 52;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...primaryColor);
    doc.text("UNVERBINDLICHE RICHTOFFERTE", 18, y);

    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...mutedColor);
    const dateStr = new Date().toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
    doc.text(`Referenz-Nr: ${sessionId.slice(0, 8).toUpperCase()}  •  Datum: ${dateStr}`, 18, y);

    // Customer & Property Box
    y += 10;
    doc.setFillColor(...lightBg);
    doc.roundedRect(18, y, 174, 32, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    const customerName = `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || "Sehr geehrte Kundin, sehr geehrter Kunde";
    doc.text(customerName, 24, y + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...mutedColor);
    if (session.email) doc.text(`E-Mail: ${session.email}`, 24, y + 15);
    if (customer.phone) doc.text(`Telefon: ${customer.phone}`, 24, y + 21);
    if (customer.address || customer.city) {
      doc.text(`Standort: ${customer.address ? customer.address + ", " : ""}${customer.postalCode || ""} ${customer.city || ""}`, 24, y + 27);
    }

    // Property / Scope Summary
    y += 40;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text("Projekt-Übersicht", 18, y);

    y += 4;
    doc.setDrawColor(220, 220, 220);
    doc.line(18, y, 192, y);

    y += 8;
    const items = [
      ["Objektart:", session.propertyType || "Wohnung / Liegenschaft"],
      ["Umfang:", (session.components || []).map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(", ") || "Wände & Decken"],
      ["Leistungen:", (session.services || []).map(s => s.replaceAll("_", " ")).join(", ") || "Malerarbeiten 2-fach deckend"],
      ["Abdeck- & Schutzarbeiten:", "Inbegriffen (Böden, Möbel, Leisten geschützt)"],
      ["Material & Werkzeuge:", "Inbegriffen (Hochwertige Schweizer Qualitätsfarben)"],
      ["Anfahrts- & Transportkosten:", "Inbegriffen / Berücksichtigt"]
    ];

    doc.setFontSize(9);
    for (const [label, val] of items) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primaryColor);
      doc.text(label, 20, y);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...mutedColor);
      doc.text(String(val), 80, y);
      y += 7;
    }

    // Price Card (Protected, total only - no unit formulas)
    y += 8;
    doc.setFillColor(243, 244, 246);
    doc.roundedRect(18, y, 174, 38, 3, 3, "F");

    doc.setFillColor(...accentYellow);
    doc.rect(18, y, 4, 38, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text("Geschätzter Angebotspreis (Richtpreis)", 28, y + 10);

    const priceText = `${formatChf(session.minCents)} – ${formatChf(session.maxCents)}`;
    doc.setFontSize(18);
    doc.setTextColor(20, 20, 20);
    doc.text(priceText, 28, y + 22);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...mutedColor);
    doc.text("Inklusive gesetzlicher MWST, aller Vorbereitungsarbeiten, Materialien und Entsorgung.", 28, y + 31);

    // Next steps
    y += 48;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text("Nächste Schritte & Kontakt", 18, y);

    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...mutedColor);
    const steps = [
      "1. Vereinbaren Sie mit uns einen kostenlosen und unverbindlichen Besichtigungstermin vor Ort.",
      "2. Nach der Besichtigung erhalten Sie Ihre finale, garantierte Festpreis-Offerte.",
      "3. Kontaktieren Sie uns bequem via Telefon unter +41 (0) 44 123 45 67 oder via WhatsApp."
    ];
    for (const step of steps) {
      doc.text(step, 18, y);
      y += 5.5;
    }

    // Footer
    doc.setFontSize(7.5);
    doc.setTextColor(150, 150, 150);
    doc.text("AMIGOS MALER GMBH • Alle Angaben unverbindlich bis zur finalen Besichtigung • Gültigkeit: 30 Tage", 105, 285, { align: "center" });

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="AMIGOS-Offerte-${sessionId.slice(0, 8)}.pdf"`
      }
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json({ error: "Failed to generate PDF quote." }, { status: 500 });
  }
}
