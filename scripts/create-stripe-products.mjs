/**
 * Creates the five test-mode Stripe products/prices and prints Price IDs
 * to paste into .env.local.
 *
 *   export PATH="$HOME/.local/node/bin:$PATH"
 *   set -a && source .env.local && set +a   # if the file exists
 *   node scripts/create-stripe-products.mjs
 */
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("Set STRIPE_SECRET_KEY (test key sk_test_…) and re-run.");
  process.exit(1);
}

const stripe = new Stripe(key);

const catalog = [
  {
    env: "STRIPE_PRICE_DEBT",
    name: "Debt Payoff Tracker spreadsheet",
    amount: 1400,
  },
  {
    env: "STRIPE_PRICE_PAYCHECK",
    name: "Paycheck Budget + Bill Tracker spreadsheet",
    amount: 1400,
  },
  {
    env: "STRIPE_PRICE_CASHFLOW",
    name: "Cash Flow Forecast spreadsheet",
    amount: 1400,
  },
  {
    env: "STRIPE_PRICE_BUNDLE",
    name: "All 3 Spreadsheet Bundle",
    amount: 2900,
  },
  {
    env: "STRIPE_PRICE_PRO",
    name: "Harbor Pro",
    amount: 1900,
  },
];

const lines = [];
for (const item of catalog) {
  const product = await stripe.products.create({
    name: item.name,
    metadata: { harbor: "true" },
    tax_code: "txcd_10103000",
  });
  const price = await stripe.prices.create({
    product: product.id,
    currency: "usd",
    unit_amount: item.amount,
  });
  console.log(`${item.name}\n  product ${product.id}\n  ${item.env}=${price.id}\n`);
  lines.push(`${item.env}=${price.id}`);
}

console.log("Paste into .env.local:\n");
console.log(lines.join("\n"));
