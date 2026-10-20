import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { purchaseFromCheckoutSession, recordPurchase } from "../../../../lib/commerce/purchases";
import { getStripe } from "../../../../lib/stripe";

export const runtime = "nodejs";

/**
 * Stripe CLI (local):
 *   stripe listen --forward-to localhost:3000/api/webhooks/stripe
 * Then copy the whsec_… signing secret into STRIPE_WEBHOOK_SECRET.
 */
export async function POST(req: Request) {
  const secret = process.env["STRIPE_WEBHOOK_SECRET"]?.trim();
  if (!secret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is not set" }, { status: 501 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const row = purchaseFromCheckoutSession(event.data.object);
    if (row) {
      try {
        await recordPurchase(row);
      } catch (err) {
        console.error("recordPurchase failed", err);
        return NextResponse.json({ error: "Could not record this sale" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
