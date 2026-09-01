import { NextResponse } from "next/server";

export const runtime = "nodejs";
import { expandGrants } from "../../../../lib/commerce/entitlements";
import { recordPurchase } from "../../../../lib/commerce/purchases";
import { getStripe } from "../../../../lib/stripe";

/**
 * Stripe CLI (local):
 *   stripe listen --forward-to localhost:3000/api/webhooks/stripe
 * Then copy the whsec_… signing secret into STRIPE_WEBHOOK_SECRET.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is not set" }, { status: 501 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const raw = await req.text();
  let event;
  try {
    event = getStripe().webhooks.constructEvent(raw, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    if (session.payment_status === "paid" || session.status === "complete") {
      const grants = expandGrants((session.metadata?.grants ?? "").split(",").filter(Boolean));
      await recordPurchase({
        sessionId: session.id,
        offerId: session.metadata?.offerId ?? "",
        grants,
        email: session.customer_details?.email ?? session.customer_email ?? null,
        amountTotal: session.amount_total,
        currency: session.currency,
        paidAt: new Date().toISOString(),
      });
    }
  }

  return NextResponse.json({ received: true });
}
