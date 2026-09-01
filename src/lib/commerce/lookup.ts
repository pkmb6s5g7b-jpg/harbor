import "server-only";
import { expandGrants } from "./entitlements";
import { listPurchasesByEmail } from "./purchases";
import { getStripe, stripeConfigured } from "../stripe";
import { normalizeEmail } from "./email";

export async function grantsForEmail(email: string): Promise<string[]> {
  const grants = new Set<string>();
  const local = await listPurchasesByEmail(email);
  for (const row of local) {
    expandGrants(row.grants).forEach((g) => grants.add(g));
  }

  if (stripeConfigured()) {
    try {
      const stripe = getStripe();
      const customers = await stripe.customers.list({ email: normalizeEmail(email), limit: 10 });
      for (const customer of customers.data) {
        const sessions = await stripe.checkout.sessions.list({
          customer: customer.id,
          limit: 20,
        });
        for (const session of sessions.data) {
          if (session.payment_status !== "paid") continue;
          expandGrants((session.metadata?.grants ?? "").split(",").filter(Boolean)).forEach((g) =>
            grants.add(g),
          );
        }
      }

      // Sessions that collected email but didn't create a customer yet
      const recent = await stripe.checkout.sessions.list({ limit: 40 });
      const want = normalizeEmail(email);
      for (const session of recent.data) {
        if (session.payment_status !== "paid") continue;
        const paidEmail = session.customer_details?.email ?? session.customer_email ?? "";
        if (normalizeEmail(paidEmail) !== want) continue;
        expandGrants((session.metadata?.grants ?? "").split(",").filter(Boolean)).forEach((g) =>
          grants.add(g),
        );
      }
    } catch {
      // Stripe lookup is extra; local records still apply.
    }
  }

  return [...grants];
}
