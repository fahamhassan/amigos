import { calculateTravelCost } from "./pricingSettings";

const COMPONENT_MINIMUMS = {
  walls: 42000,
  ceilings: 26000,
  doors: 18000,
  windows: 16000,
  radiators: 14000,
  baseboards: 12000,
  facade: 90000,
  railings: 18000,
  stairs: 22000,
  other: 18000
};

const PROPERTY_MULTIPLIERS = {
  apartment: 1,
  house: 1.08,
  commercial: 1.16,
  facade: 1.2,
  room: 0.92,
  other: 1.05
};

const SERVICE_FACTORS = {
  ceiling_paint_2_coats: 1,
  wall_paint_2_coats: 1,
  remove_wallpaper: 0.46,
  apply_wallpaper: 1.18,
  filling_spackling: 0.52,
  mold_treatment: 0.7,
  nicotine_treatment: 0.62,
  water_damage_repair: 0.86,
  priming_sealing: 0.38,
  covering_protection: 0.22,
  paint_railings: 0.85,
  paint_stairs: 0.95
};

const QUANTITY_RULES = {
  walls: { key: "wallArea", minimum: 12, weight: 1850 },
  ceilings: { key: "ceilingArea", minimum: 8, weight: 1600 },
  doors: { key: "doors", minimum: 1, weight: 14500 },
  windows: { key: "windows", minimum: 1, weight: 11000 },
  radiators: { key: "radiators", minimum: 1, weight: 12500 },
  baseboards: { key: "baseboards", minimum: 8, weight: 1650 },
  facade: { key: "facadeArea", minimum: 25, weight: 2850 },
  railings: { key: "railingLength", minimum: 2, weight: 6500 },
  stairs: { key: "stairSteps", minimum: 5, weight: 4500 },
  other: { key: "otherUnits", minimum: 1, weight: 18000 }
};

function asNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function unique(values) {
  return [...new Set(Array.isArray(values) ? values : [])];
}

export function calculateOfferPrice(project, options = {}) {
  const components = unique(project.components);
  const services = unique(project.services);
  const quantities = project.quantities || {};
  const propertyMultiplier = PROPERTY_MULTIPLIERS[project.propertyType] || PROPERTY_MULTIPLIERS.other;

  let componentTotal = 0;

  for (const component of components) {
    const rule = QUANTITY_RULES[component];
    if (!rule) continue;

    const quantity = Math.max(asNumber(quantities[rule.key]), rule.minimum);
    componentTotal += Math.max(quantity * rule.weight, COMPONENT_MINIMUMS[component] || 0);
  }

  const serviceFactor = services.reduce((total, service) => total + (SERVICE_FACTORS[service] || 0.35), 0);
  const preparationFactor = services.some((service) => [
    "filling_spackling",
    "mold_treatment",
    "nicotine_treatment",
    "water_damage_repair",
    "priming_sealing"
  ].includes(service)) ? 1.18 : 1;
  const projectSizeFactor = componentTotal > 650000 ? 0.94 : componentTotal < 180000 ? 1.12 : 1;

  // Condition modifier (Section 13)
  const condition = options.condition || project.condition || "good";
  let conditionFactor = 1.0;
  if (condition === "minor_repairs") conditionFactor = 1.15;
  else if (condition === "renovation") conditionFactor = 1.35;

  // Travel cost calculation (Section 9)
  const postalCode = options.postalCode || project.postalCode || "";
  const travelCostChf = postalCode ? calculateTravelCost(postalCode, options.settings) : 45;
  const travelCostCents = travelCostChf * 100;

  const subtotal = componentTotal * clamp(0.82 + serviceFactor * 0.18, 0.9, 1.9);
  const estimate = Math.max(65000, subtotal * propertyMultiplier * preparationFactor * projectSizeFactor * conditionFactor) + travelCostCents;
  const min = Math.round((estimate * 0.92) / 1000) * 1000;
  const max = Math.round((estimate * 1.12) / 1000) * 1000;

  return {
    currency: "CHF",
    minCents: min,
    maxCents: Math.max(max, min + 35000),
    travelCostChf
  };
}
