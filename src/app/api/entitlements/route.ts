import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ENTITLEMENT_COOKIE, PRICES } from "../../../config/pricing";
import { expandGrants, parseEntitlementCookie } from "../../../lib/commerce/entitlements";

export async function GET() {
  const jar = await cookies();
  const owned = parseEntitlementCookie(jar.get(ENTITLEMENT_COOKIE)?.value);
  return NextResponse.json({ owned: expandGrants(owned), prices: PRICES });
}

/**
 * Purchases are not granted here. Pro, the core bundle, and paid templates
 * are written only after Stripe confirms payment (checkout confirm or Restore).
 */
export async function POST() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

/** Clears this browser’s download cookie so you can test Checkout again. Local only. */
export async function DELETE() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const jar = await cookies();
  jar.delete(ENTITLEMENT_COOKIE);
  return NextResponse.json({ ok: true });
}
