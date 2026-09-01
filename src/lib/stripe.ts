import "server-only";
import Stripe from "stripe";
import { STRIPE_PRICE_ENV } from "../config/pricing";

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY. Add your test key to .env.local.");
  }
  return new Stripe(key);
}

export function getStripePriceId(offerId: string): string | null {
  const envName = STRIPE_PRICE_ENV[offerId];
  if (!envName) return null;
  const id = process.env[envName]?.trim() ?? "";
  if (!id || id.startsWith("price_REPLACE")) return null;
  return id;
}

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function siteOrigin(req: Request): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (env) return env;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`;
  return "http://localhost:3000";
}
