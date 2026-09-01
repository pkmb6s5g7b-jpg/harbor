import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { STRIPE_CHECKOUT_OFFER_IDS } from "../../../config/pricing";
import { resolveOffer } from "../../../lib/commerce/resolve-offer";
import { getStripe, getStripePriceId, siteOrigin, stripeConfigured } from "../../../lib/stripe";

export async function POST(req: Request) {
  const body = (await req.json()) as { offerId?: string };
  const offerId = body.offerId ?? "";
  const offer = resolveOffer(offerId);
  if (!offer) {
    return NextResponse.json({ error: "Unknown offer" }, { status: 400 });
  }

  const usesStripe = (STRIPE_CHECKOUT_OFFER_IDS as readonly string[]).includes(offer.id);
  if (!usesStripe) {
    return NextResponse.json({ mode: "placeholder", offerId: offer.id });
  }

  const cancelPath = offer.kind === "pro" ? "/pricing" : "/cancel";

  if (!stripeConfigured()) {
    return NextResponse.json(
      {
        error:
          "Stripe is not configured. Add STRIPE_SECRET_KEY and the STRIPE_PRICE_* IDs to .env.local (see README).",
      },
      { status: 503 },
    );
  }

  const priceId = getStripePriceId(offer.id);
  if (!priceId) {
    return NextResponse.json(
      {
        error: `Missing Stripe Price ID for ${offer.id}. Set ${offer.stripePriceEnv} in .env.local.`,
      },
      { status: 503 },
    );
  }

  const origin = siteOrigin(req);
  const stripe = getStripe();
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_creation: "always",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${cancelPath}`,
      metadata: {
        offerId: offer.id,
        grants: offer.grants.join(","),
      },
      // Digital goods: don't require Stripe Managed Payments tax codes.
      managed_payments: { enabled: false },
    } as Parameters<Stripe["checkout"]["sessions"]["create"]>[0]);

    if (!session.url) {
      return NextResponse.json({ error: "Stripe did not return a Checkout URL." }, { status: 502 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe Checkout failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
