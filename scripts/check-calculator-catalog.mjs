/**
 * Guards against a silent failure mode: adding a component or service to the calculator
 * UI without adding it to the server-side whitelist in validation.js. When that happens
 * the value is stripped during validation and the customer sees "please select at least
 * one component" for something they did select.
 *
 * Run with: node scripts/check-calculator-catalog.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";

const read = (p) => fs.readFile(path.join(process.cwd(), p), "utf8");

const ui = await read("src/components/offer-calculator/OfferCalculator.jsx");
const validation = await read("src/lib/offerCalculator/validation.js");

const listFromSet = (source, name) => {
  const block = source.match(new RegExp(`${name}\\s*=\\s*new Set\\(\\[([\\s\\S]*?)\\]\\)`));
  return new Set([...(block?.[1].matchAll(/"([^"]+)"/g) ?? [])].map((m) => m[1]));
};

const idsFrom = (source, arrayName) => {
  const block = source.match(new RegExp(`const ${arrayName} = \\[([\\s\\S]*?)\\n\\];`));
  return [...(block?.[1].matchAll(/\{\s*id:\s*"([^"]+)"/g) ?? [])].map((m) => m[1]);
};

const problems = [];

const uiComponents = [...idsFrom(ui, "componentOptions"), "facade"];
const allowedComponents = listFromSet(validation, "COMPONENTS");
for (const id of uiComponents) {
  if (!allowedComponents.has(id)) problems.push(`component "${id}" is offered in the UI but missing from COMPONENTS`);
}

const uiServices = idsFrom(ui, "serviceOptions");
const allowedServices = listFromSet(validation, "SERVICES");
for (const id of uiServices) {
  if (!allowedServices.has(id)) problems.push(`service "${id}" is offered in the UI but missing from SERVICES`);
}

const quantityKeys = [...ui.matchAll(/quantityKey:\s*"([^"]+)"/g)].map((m) => m[1]);
const allowedQuantities = listFromSet(validation, "QUANTITY_KEYS");
for (const key of quantityKeys) {
  if (!allowedQuantities.has(key)) problems.push(`quantity key "${key}" is used in the UI but missing from QUANTITY_KEYS`);
}

if (problems.length) {
  console.error("Calculator catalog mismatch:\n" + problems.map((p) => `  - ${p}`).join("\n"));
  process.exit(1);
}

console.log(
  `Calculator catalog OK — ${uiComponents.length} components, ${uiServices.length} services, ` +
  `${new Set(quantityKeys).size} quantity keys all whitelisted.`
);
