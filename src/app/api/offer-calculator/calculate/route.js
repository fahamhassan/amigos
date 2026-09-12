import { NextResponse } from "next/server";
import { createOrUpdateCalculation } from "@/lib/offerCalculator/store";
import { validateCalculatorProject } from "@/lib/offerCalculator/validation";

export async function POST(request) {
  const payload = await request.json().catch(() => ({}));
  const validation = validateCalculatorProject(payload);

  if (!validation.valid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  // Location and condition are collected at step 05 (§7B) so the detailed quote is priced
  // with the customer's actual travel cost and surface condition, not a flat fallback.
  const result = await createOrUpdateCalculation(validation.values, {
    condition: payload.condition || "good",
    postalCode: String(payload.postalCode || "").trim(),
    locationCity: String(payload.locationCity || "").trim(),
    source: "DETAILED_QUOTE"
  });

  return NextResponse.json({
    sessionId: result.sessionId,
    status: result.status,
    currency: result.currency,
    lockedPrice: true
  });
}
