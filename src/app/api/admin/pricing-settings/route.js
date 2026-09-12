import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { DEFAULT_PRICING_SETTINGS } from "@/lib/offerCalculator/pricingSettings";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/session";

export const runtime = "nodejs";

async function requireAdmin(request) {
  const session = await verifyAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
  return session ? null : NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}

export async function GET(request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const rows = await sql`
      select key, value, description, category, updated_at as "updatedAt"
      from pricing_settings
      order by category, key
    `;

    return NextResponse.json({ settings: rows });
  } catch (err) {
    console.error("Failed to load pricing settings:", err);
    return NextResponse.json({ error: "Failed to load pricing settings." }, { status: 500 });
  }
}

export async function PUT(request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const body = await request.json();
    const { updates } = body; // array of { key, value }

    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: "Invalid updates format. Array expected." }, { status: 400 });
    }

    for (const item of updates) {
      if (item.key && item.value !== undefined) {
        await sql`
          insert into pricing_settings (key, value, updated_at)
          values (${item.key}, ${String(item.value)}, now())
          on conflict (key) do update set
            value = ${String(item.value)},
            updated_at = now()
        `;
      }
    }

    const rows = await sql`select key, value from pricing_settings`;
    return NextResponse.json({ ok: true, settings: rows });
  } catch (err) {
    console.error("Failed to update pricing settings:", err);
    return NextResponse.json({ error: "Failed to update pricing settings." }, { status: 500 });
  }
}
