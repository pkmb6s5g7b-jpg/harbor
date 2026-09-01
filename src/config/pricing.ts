/**
 * Central catalog for paid templates and the bundle.
 *
 * Change dollar amounts here — buttons follow.
 * Stripe Price IDs live in env vars (see STRIPE_PRICE_ENV). Never put secret keys here.
 *
 * STRIPE_PRICE_DEBT, STRIPE_PRICE_PAYCHECK, STRIPE_PRICE_CASHFLOW, STRIPE_PRICE_BUNDLE, STRIPE_PRICE_PRO
 */
export const PRICES = {
  spreadsheet: 14,
  bundle: 29,
  pro: 19,
} as const;

export const CORE_TEMPLATE_IDS = [
  "debt-payoff-tracker",
  "paycheck-budget-tracker",
  "cash-flow-forecast",
] as const;

export type CoreTemplateId = (typeof CORE_TEMPLATE_IDS)[number];

export type Offer = {
  id: string;
  name: string;
  price: number;
  blurb: string;
  /** Entitlement ids granted after a successful payment. */
  grants: string[];
  kind: "pro" | "template" | "bundle";
  /** Env var that holds this offer’s Stripe Price ID (price_…). */
  stripePriceEnv: string;
};

export function formatPrice(n: number): string {
  return `$${n}`;
}

export const STRIPE_PRICE_ENV: Record<string, string> = {
  pro: "STRIPE_PRICE_PRO",
  "core-bundle": "STRIPE_PRICE_BUNDLE",
  "debt-payoff-tracker": "STRIPE_PRICE_DEBT",
  "paycheck-budget-tracker": "STRIPE_PRICE_PAYCHECK",
  "cash-flow-forecast": "STRIPE_PRICE_CASHFLOW",
};

export const offers: Record<string, Offer> = {
  pro: {
    id: "pro",
    name: "Harbor Pro",
    price: PRICES.pro,
    blurb: "Save plans, export reports, and quieter prompts in the browser. Spreadsheet files are sold separately.",
    grants: ["pro"],
    kind: "pro",
    stripePriceEnv: STRIPE_PRICE_ENV.pro,
  },
  "core-bundle": {
    id: "core-bundle",
    name: "All 3 Spreadsheet Bundle",
    price: PRICES.bundle,
    blurb: "Debt Payoff, Paycheck Budget, and Cash Flow Forecast workbooks. Best value for the files.",
    grants: [...CORE_TEMPLATE_IDS],
    kind: "bundle",
    stripePriceEnv: STRIPE_PRICE_ENV["core-bundle"],
  },
};

export function getOffer(id: string): Offer | undefined {
  return offers[id];
}

export function templateOffer(id: string, name: string, blurb: string): Offer {
  return {
    id,
    name,
    price: PRICES.spreadsheet,
    blurb,
    grants: [id],
    kind: "template",
    stripePriceEnv: STRIPE_PRICE_ENV[id] ?? "",
  };
}

export const ENTITLEMENT_COOKIE = "harbor_entitlements";

/** Offers that go through Stripe Checkout. */
export const STRIPE_CHECKOUT_OFFER_IDS = [
  "pro",
  "debt-payoff-tracker",
  "paycheck-budget-tracker",
  "cash-flow-forecast",
  "core-bundle",
] as const;
