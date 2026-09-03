import "server-only";
import type Stripe from "stripe";
import { STRIPE_PRICE_ENV } from "../../config/pricing";
import { expandGrants } from "./entitlements";
import { listPurchasesByEmail } from "./purchases";
import { resolveOffer } from "./resolve-offer";
import { getStripe, readEnv, stripeConfigured } from "../stripe";
import { normalizeEmail } from "./email";

async function grantsFromSession(stripe: Stripe, session: Stripe.Checkout.Session): Promise<string[]> {
  const fromMeta = expandGrants((session.metadata?.grants ?? "").split(",").filter(Boolean));
  if (fromMeta.length) return fromMeta;
  const offerId = session.metadata?.offerId ?? "";
  if (offerId) {
    const offer = resolveOffer(offerId);
    if (offer) return expandGrants(offer.grants);
  }

  const full = await stripe.checkout.sessions.retrieve(session.id, { expand: ["line_items.data.price"] });
  const priceIds = new Set(
    (full.line_items?.data ?? [])
      .map((item) => {
        const price = item.price;
        if (typeof price === "string") return price;
        return price?.id ?? "";
      })
      .filter(Boolean),
  );
  const grants = new Set<string>();
  for (const [id, envName] of Object.entries(STRIPE_PRICE_ENV)) {
    const priceId = readEnv(envName);
    if (!priceId || !priceIds.has(priceId)) continue;
    const offer = resolveOffer(id);
    if (offer) expandGrants(offer.grants).forEach((g) => grants.add(g));
  }
  return [...grants];
}

function sessionPaid(session: Stripe.Checkout.Session): boolean {
  return session.payment_status === "paid" || session.status === "complete";
}

function customerIdOf(session: Stripe.Checkout.Session): string {
  const customer = session.customer;
  if (typeof customer === "string") return customer;
  if (customer && typeof customer === "object" && "id" in customer) return customer.id;
  return "";
}

async function emailForSession(stripe: Stripe, session: Stripe.Checkout.Session): Promise<string> {
  const direct = normalizeEmail(session.customer_details?.email ?? session.customer_email ?? "");
  if (direct) return direct;
  const customerId = customerIdOf(session);
  if (!customerId) return "";
  const customer = await stripe.customers.retrieve(customerId);
  if ("deleted" in customer && customer.deleted) return "";
  return normalizeEmail(customer.email ?? "");
}

export async function grantsForEmail(email: string): Promise<string[]> {
  const grants = new Set<string>();
  const want = normalizeEmail(email);

  const local = await listPurchasesByEmail(email);
  for (const row of local) {
    expandGrants(row.grants).forEach((g) => grants.add(g));
  }

  if (!stripeConfigured()) return [...grants];

  try {
    const stripe = getStripe();
    const customerIds = new Set<string>();

    const listed = await stripe.customers.list({ email: want, limit: 100 });
    for (const customer of listed.data) customerIds.add(customer.id);

    try {
      const searched = await stripe.customers.search({ query: `email:"${want}"`, limit: 100 });
      for (const customer of searched.data) customerIds.add(customer.id);
    } catch (err) {
      console.error("grantsForEmail customer search skipped", err);
    }

    for (const customerId of customerIds) {
      const sessions = await stripe.checkout.sessions.list({ customer: customerId, limit: 100 });
      for (const session of sessions.data) {
        if (!sessionPaid(session)) continue;
        (await grantsFromSession(stripe, session)).forEach((g) => grants.add(g));
      }
    }

    let startingAfter: string | undefined;
    for (let page = 0; page < 3; page++) {
      const batch = await stripe.checkout.sessions.list({
        limit: 40,
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      });
      for (const session of batch.data) {
        if (!sessionPaid(session)) continue;
        const paidEmail = await emailForSession(stripe, session);
        if (paidEmail !== want) continue;
        (await grantsFromSession(stripe, session)).forEach((g) => grants.add(g));
      }
      if (!batch.has_more || batch.data.length === 0) break;
      startingAfter = batch.data[batch.data.length - 1]?.id;
    }
  } catch (err) {
    console.error("grantsForEmail Stripe lookup failed", err);
  }

  return [...grants];
}
