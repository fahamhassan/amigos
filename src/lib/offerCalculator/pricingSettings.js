import { sql } from "@/lib/db";

export const DEFAULT_PRICING_SETTINGS = {
  "2_5_room_apartment_base_price": 2400,
  "3_5_room_apartment_base_price": 3200,
  "4_5_room_apartment_base_price": 4100,
  "5_5_room_apartment_base_price": 5200,
  "house_base_price": 6500,
  "commercial_base_price": 4800,
  "other_base_price": 3200,
  "walls_modifier": 0.70,
  "ceilings_modifier": 0.50,
  "walls_and_ceilings_modifier": 1.00,
  "good_condition_modifier": 1.00,
  "minor_repairs_modifier": 1.15,
  "renovation_modifier": 1.35,
  "travel_cost_per_km": 2.50,
  "base_travel_flat_fee": 45.00,

  // Detailed calculator factors (§13) — previously hard-coded in pricing.js.
  "component_min_walls": 42000,
  "component_min_ceilings": 26000,
  "component_min_doors": 18000,
  "component_min_windows": 16000,
  "component_min_radiators": 14000,
  "component_min_baseboards": 12000,
  "component_min_facade": 90000,
  "component_min_railings": 18000,
  "component_min_stairs": 22000,
  "component_min_other": 18000,
  "property_multiplier_apartment": 1,
  "property_multiplier_house": 1.08,
  "property_multiplier_commercial": 1.16,
  "property_multiplier_facade": 1.2,
  "property_multiplier_room": 0.92,
  "property_multiplier_other": 1.05,
  "service_factor_ceiling_paint_2_coats": 1,
  "service_factor_wall_paint_2_coats": 1,
  "service_factor_remove_wallpaper": 0.46,
  "service_factor_apply_wallpaper": 1.18,
  "service_factor_filling_spackling": 0.52,
  "service_factor_mold_treatment": 0.7,
  "service_factor_nicotine_treatment": 0.62,
  "service_factor_water_damage_repair": 0.86,
  "service_factor_priming_sealing": 0.38,
  "service_factor_covering_protection": 0.22,
  "service_factor_paint_railings": 0.85,
  "service_factor_paint_stairs": 0.95,
  "service_factor_paint_doors": 0.9,
  "service_factor_paint_windows": 0.85,
  "service_factor_paint_radiators": 0.8,
  "service_factor_paint_baseboards": 0.6,
  "service_factor_paint_other": 0.8,
  "quantity_weight_walls": 1850,
  "quantity_min_walls": 12,
  "quantity_weight_ceilings": 1600,
  "quantity_min_ceilings": 8,
  "quantity_weight_doors": 14500,
  "quantity_min_doors": 1,
  "quantity_weight_windows": 11000,
  "quantity_min_windows": 1,
  "quantity_weight_radiators": 12500,
  "quantity_min_radiators": 1,
  "quantity_weight_baseboards": 1650,
  "quantity_min_baseboards": 8,
  "quantity_weight_facade": 2850,
  "quantity_min_facade": 25,
  "quantity_weight_railings": 6500,
  "quantity_min_railings": 2,
  "quantity_weight_stairs": 4500,
  "quantity_min_stairs": 5,
  "quantity_weight_other": 18000,
  "quantity_min_other": 1,
  "service_factor_default": 0.35,
  "preparation_surcharge": 1.18,
  "large_project_discount": 0.94,
  "small_project_surcharge": 1.12,
  "detailed_minimum_cents": 65000,

  // Component option multipliers (§4 doors, §6 railings).
  "door_type_standard_multiplier": 1,
  "door_type_double_multiplier": 1.6,
  "door_type_entrance_multiplier": 1.4,
  "door_type_other_multiplier": 1.1,
  "door_material_wood_multiplier": 1,
  "door_material_metal_multiplier": 1.15,
  "door_material_unsure_multiplier": 1.05,
  "door_sides_one_side_multiplier": 0.6,
  "door_sides_both_sides_multiplier": 1,
  "door_frame_multiplier": 1.2,
  "door_condition_good_multiplier": 1,
  "door_condition_minor_multiplier": 1.15,
  "door_condition_renovation_multiplier": 1.35,
  "railing_type_balcony_multiplier": 1,
  "railing_type_stair_multiplier": 1.1,
  "railing_material_metal_multiplier": 1,
  "railing_material_wood_multiplier": 0.95,
  "railing_condition_good_multiplier": 1,
  "railing_condition_minor_multiplier": 1.15,
  "railing_condition_renovation_multiplier": 1.35,
  "service_factor_railing_cleaning": 0.3,
  "service_factor_railing_sanding": 0.45,
  "service_factor_railing_priming": 0.38
};

export async function getPricingSettings() {
  try {
    const rows = await sql`select key, value from pricing_settings`;
    const settings = { ...DEFAULT_PRICING_SETTINGS };
    for (const row of rows) {
      const num = Number(row.value);
      if (!Number.isNaN(num)) {
        settings[row.key] = num;
      }
    }
    return settings;
  } catch (err) {
    console.error("Error fetching pricing settings, using defaults:", err);
    return { ...DEFAULT_PRICING_SETTINGS };
  }
}

export function calculateTravelCost(postalCode, settings) {
  const plz = parseInt(String(postalCode || "").trim(), 10);
  const flat = settings?.base_travel_flat_fee ?? 45;
  const perKm = settings?.travel_cost_per_km ?? 2.50;

  if (Number.isNaN(plz)) {
    return Math.round(flat);
  }

  let approxKm = 15;
  if (plz >= 8000 && plz < 8100) approxKm = 8;
  else if (plz >= 8100 && plz < 8999) approxKm = 20;
  else if (plz >= 4000 && plz < 5000) approxKm = 35;
  else if (plz >= 5000 && plz < 6000) approxKm = 25;
  else if (plz >= 6000 && plz < 7000) approxKm = 40;
  else if (plz >= 1000 && plz < 4000) approxKm = 65;
  else approxKm = 30;

  return Math.round(flat + (approxKm * perKm));
}
