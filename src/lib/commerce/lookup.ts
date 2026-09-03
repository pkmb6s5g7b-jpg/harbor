import "server-only";
import type Stripe from "stripe";
import { expandGrants } from "./entitlements";
import { listPurchasesByEmail } from "./purchases";
import { resolveOffer } from "./resolve-offer";
import { getStripe, stripeConfigured } from "../stripe";
import { normalizeEmail } from "./email";

function grantsFromSession(session: Stripe.Checkout.Session): string[] {
  const fromMeta = expandGrants((session.metadata?.grants ?? "").split(",").filter(Boolean));
  if (fromMeta.length) return fromMeta;
  const offerId = session.metadata?.offerId ?? "";
  if (!offerId) return [];
  const offer = resolveOffer(offerId);
  return offer ? expandGrants(offer.grants) : [];
}

function sessionPaid(session: Stripe.Checkout.Session): boolean {
  return session.payment_status === "paid" || session.status === "complete";
}

function sessionEmail(session: Stripe.Checkout.Session): string {
  return normalizeEmail(session.customer_details?.email ?? session.customer_email ?? "");
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
        grantsFromSession(session).forEach((g) => grants.add(g));
      }
    }

    let startingAfter: string | undefined;
    for (let page = 0; page < 5; page++) {
      const batch = await stripe.checkout.sessions.list({
        limit: 100,
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      });
      for (const session of batch.data) {
        if (!sessionPaid(session)) continue;
        let full = session;
        if (!sessionEmail(session)) {
          full = await stripe.checkout.sessions.retrieve(session.id);
        }
        if (sessionEmail(full) !== want) continue;
        grantsFromSession(full).forEach((g) => grants.add(g));
      }
      if (!batch.has_more || batch.data.length === 0) break;
      startingAfter = batch.data[batch.data.length - 1]?.id;
    }
  } catch (err) {
    console.error("grantsForEmail Stripe lookup failed", err);
  }

  return [...grants];
}
