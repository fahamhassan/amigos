import { NextResponse } from "next/server";
import { createOrUpdateCalculation } from "@/lib/offerCalculator/store";
import { validateCalculatorProject } from "@/lib/offerCalculator/validation";

// Average surface estimations per room based on size preset:
// Small: ~12m² floor/ceiling, ~28m² walls (3x4m, 2.5m ceiling minus doors/windows)
// Medium: ~18m² floor/ceiling, ~38m² walls (4x4.5m, 2.5m ceiling)
// Large: ~26m² floor/ceiling, ~50m² walls (5x5.2m, 2.5m ceiling)
const ROOM_SIZE_SURFACES = {
  small: { wallArea: 28, ceilingArea: 12 },
  medium: { wallArea: 38, ceilingArea: 18 },
  large: { wallArea: 50, ceilingArea: 26 }
};

export async function POST(request) {
  try {
    const payload = await request.json().catch(() => ({}));
    let rawPropertyType = payload.propertyType || "apartment";
    // Normalize quick property types (e.g., "2_5_apartment" -> "apartment")
    let propertyType = rawPropertyType;
    if (rawPropertyType.includes("apartment")) {
      propertyType = "apartment";
    } else if (!["apartment", "house", "commercial", "facade", "room", "other"].includes(rawPropertyType)) {
      propertyType = "apartment";
    }
    const roomCount = Math.max(1, Math.min(20, Number(payload.roomCount) || 1));
    const roomSize = ["small", "medium", "large"].includes(payload.roomSize) ? payload.roomSize : "medium";
    const selectedServices = Array.isArray(payload.services) ? payload.services : ["paint_walls"];
    const projectNotes = String(payload.projectNotes || "").trim();

    const surfaces = ROOM_SIZE_SURFACES[roomSize] || ROOM_SIZE_SURFACES.medium;
    const totalWallArea = Math.round(surfaces.wallArea * roomCount);
    const totalCeilingArea = Math.round(surfaces.ceilingArea * roomCount);

    const components = [];
    const services = [];
    const quantities = {};

    const workScope = payload.workScope || "walls_ceilings";
    const condition = payload.condition || "good";
    const postalCode = payload.postalCode || "";
    const locationCity = payload.locationCity || "";

    if (propertyType === "facade") {
      components.push("facade");
      quantities.facadeArea = Math.max(50, roomCount * 45);
      services.push("wall_paint_2_coats");
    } else {
      const wantsCeiling = workScope === "ceilings" || workScope === "walls_ceilings" || selectedServices.includes("paint_ceilings");
      const wantsWalls = workScope === "walls" || workScope === "walls_ceilings" || selectedServices.includes("paint_walls");

      if (wantsWalls) {
        components.push("walls");
        quantities.wallArea = totalWallArea;
        services.push("wall_paint_2_coats");
      }

      if (wantsCeiling) {
        components.push("ceilings");
        quantities.ceilingArea = totalCeilingArea;
        services.push("ceiling_paint_2_coats");
      }

      if (condition === "minor_repairs" || selectedServices.includes("filling_spackling")) {
        services.push("filling_spackling");
      }
      if (condition === "renovation") {
        if (!services.includes("filling_spackling")) services.push("filling_spackling");
        services.push("priming_sealing");
      }
      if (selectedServices.includes("priming_sealing") && !services.includes("priming_sealing")) {
        services.push("priming_sealing");
      }
      services.push("covering_protection");
    }

    if (components.length === 0) {
      components.push("walls");
      quantities.wallArea = totalWallArea;
      services.push("wall_paint_2_coats");
    }
    if (services.length === 0) {
      services.push("wall_paint_2_coats");
    }

    const projectPayload = {
      mode: "CALCULATE",
      propertyType,
      roomType: payload.roomType || "",
      components,
      services,
      quantities,
      projectNotes: [
        `Quick Estimate: ${roomCount} room(s), size: ${roomSize}, scope: ${workScope}, condition: ${condition}`,
        postalCode ? `Location: ${postalCode} ${locationCity}` : "",
        projectNotes
      ].filter(Boolean).join(" | ")
    };

    const validation = validateCalculatorProject(projectPayload);
    if (!validation.valid) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }

    const result = await createOrUpdateCalculation(validation.values, { condition, postalCode, source: "QUICK_QUOTE" });

    return NextResponse.json({
      sessionId: result.sessionId,
      status: result.status,
      currency: result.currency,
      lockedPrice: true,
      priceLabel: "CHF ••••.–",
      estimatedSurfaces: {
        wallArea: totalWallArea,
        ceilingArea: totalCeilingArea,
        roomCount
      }
    });
  } catch (error) {
    console.error("quick-calculate error:", error);
    return NextResponse.json({ error: "Failed to calculate estimate." }, { status: 500 });
  }
}
