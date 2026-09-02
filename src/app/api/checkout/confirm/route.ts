import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ENTITLEMENT_COOKIE } from "../../../../config/pricing";
import { products } from "../../../../data/products";
import { expandGrants, hasAccess, parseEntitlementCookie, serializeEntitlements } from "../../../../lib/commerce/entitlements";
import { recordPurchase } from "../../../../lib/commerce/purchases";
import { getStripe, stripeConfigured } from "../../../../lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json()) as { session_id?: string };
  const sessionId = body.session_id?.trim();
  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Missing Checkout session" }, { status: 400 });
  }
  if (!stripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    return NextResponse.json(
      { error: "Payment not completed", payment_status: session.payment_status },
      { status: 402 },
    );
  }

  const offerId = session.metadata?.offerId ?? "";
  const grants = expandGrants((session.metadata?.grants ?? "").split(",").filter(Boolean));
  if (grants.length === 0) {
    return NextResponse.json({ error: "Session is missing product metadata" }, { status: 400 });
  }

  await recordPurchase({
    sessionId: session.id,
    offerId,
    grants,
    email: session.customer_details?.email ?? session.customer_email ?? null,
    amountTotal: session.amount_total,
    currency: session.currency,
    paidAt: new Date().toISOString(),
  });

  const jar = await cookies();
  const existing = parseEntitlementCookie(jar.get(ENTITLEMENT_COOKIE)?.value);
  const merged = expandGrants([...existing, ...grants]);
  jar.set(ENTITLEMENT_COOKIE, serializeEntitlements(merged), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  const files = products
    .filter((p) => p.fileName && hasAccess(merged, p.id))
    .map((p) => ({ id: p.id, name: p.name, fileName: p.fileName, blurb: p.blurb }));

  return NextResponse.json({
    paid: true,
    offerId,
    grants: merged,
    files,
    email: session.customer_details?.email ?? null,
  });
}
