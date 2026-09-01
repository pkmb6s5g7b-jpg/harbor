import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CORE_TEMPLATE_IDS, ENTITLEMENT_COOKIE, offers, PRICES } from "../../../config/pricing";
import { products } from "../../../data/products";
import { expandGrants, parseEntitlementCookie, serializeEntitlements } from "../../../lib/commerce/entitlements";

const ALLOWED = new Set<string>([
  "pro",
  "core-bundle",
  ...products.map((p) => p.id),
  ...CORE_TEMPLATE_IDS,
  ...Object.keys(offers),
]);

export async function GET() {
  const jar = await cookies();
  const owned = parseEntitlementCookie(jar.get(ENTITLEMENT_COOKIE)?.value);
  return NextResponse.json({ owned: expandGrants(owned), prices: PRICES });
}

/** Called by the placeholder checkout after a “payment”. Stripe webhook will do this later. */
export async function POST(req: Request) {
  const body = (await req.json()) as { skus?: string[]; email?: string };
  const requested = (body.skus ?? []).filter((s) => ALLOWED.has(s));
  if (requested.length === 0) {
    return NextResponse.json({ error: "No valid SKUs" }, { status: 400 });
  }

  const jar = await cookies();
  const existing = parseEntitlementCookie(jar.get(ENTITLEMENT_COOKIE)?.value);
  const merged = expandGrants([...existing, ...requested]);

  jar.set(ENTITLEMENT_COOKIE, serializeEntitlements(merged), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return NextResponse.json({ ok: true, owned: merged, downloads: "/downloads?paid=1" });
}

/** Clears this browser’s download cookie so you can test Checkout again. */
export async function DELETE() {
  const jar = await cookies();
  jar.delete(ENTITLEMENT_COOKIE);
  return NextResponse.json({ ok: true });
}
