import { sql } from "@/lib/db";

export const DEFAULT_PRICING_SETTINGS = {
  "2_5_room_apartment_base_price": 2400,
  "3_5_room_apartment_base_price": 3200,
  "4_5_room_apartment_base_price": 4100,
  "5_5_room_apartment_base_price": 5200,
  "house_base_price": 6500,
  "commercial_base_price": 4800,
  "walls_modifier": 0.70,
  "ceilings_modifier": 0.50,
  "walls_and_ceilings_modifier": 1.00,
  "good_condition_modifier": 1.00,
  "minor_repairs_modifier": 1.15,
  "renovation_modifier": 1.35,
  "travel_cost_per_km": 2.50,
  "base_travel_flat_fee": 45.00
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
