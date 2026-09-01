# Harbor

Simple money tools that stay with you. Free web calculators for debt payoff, paycheck budgeting, and cash flow. Full Excel & Google Sheets templates are paid through Stripe ($14 each, or all 3 for $29).

## Run locally

Node 22+ is required (`~/.local/node` if it isn’t on your PATH).

```bash
cd /Users/jasonbentle/Desktop/Projects/harbor
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test      # calculator engines vs spreadsheet sample numbers
npm run build
```

## Deploy (put it on the internet)

Vercel is the straightforward host for this Next.js app. Free hobby plan is enough to start.

1. Create a free account at [github.com](https://github.com) if you don’t have one.
2. Create a free account at [vercel.com](https://vercel.com) (sign in with GitHub).
3. Put this project on GitHub:
   - In GitHub: **New repository** (e.g. `harbor`), leave it empty (no README).
   - On your Mac, in Terminal:

```bash
cd /Users/jasonbentle/Desktop/Projects/harbor
git add .
git status   # confirm .env.local is NOT listed
git commit -m "Harbor calculators, Stripe, restore"
git remote add origin https://github.com/YOUR_USERNAME/harbor.git
git push -u origin main
```

4. In Vercel: **Add New → Project → Import** that GitHub repo.
5. Before the first deploy, open **Environment Variables** and paste from your `.env.local`:
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_PRICE_DEBT` / `PAYCHECK` / `CASHFLOW` / `BUNDLE` / `PRO`
   - `NEXT_PUBLIC_SITE_URL` — after the first deploy, set this to `https://YOUR-APP.vercel.app` and redeploy
   - `STRIPE_WEBHOOK_SECRET` — add after step 7
6. Click **Deploy**. You’ll get a URL like `https://harbor-xxxx.vercel.app`.
7. Stripe Dashboard (test mode) → **Developers → Webhooks → Add endpoint**  
   `https://YOUR-APP.vercel.app/api/webhooks/stripe`  
   Event: `checkout.session.completed`  
   Copy the `whsec_…` into Vercel as `STRIPE_WEBHOOK_SECRET` and redeploy.

Keep using **test** keys until you’ve paid with `4242…` on the live URL. Then create the same products in Stripe **live** mode and swap the env vars.

Do **not** commit `.env.local`. Spreadsheet `.xlsx` files live in `content/spreadsheets/` and deploy with the app.

## Stripe Checkout (templates)

The three calculators stay free. Spreadsheet Buy buttons create a Stripe Checkout Session on the server and send the customer to Stripe-hosted Checkout.

### 1. Create a Stripe account

Sign up at [https://dashboard.stripe.com](https://dashboard.stripe.com) and stay in **Test mode**.

### 2. Get test keys

Dashboard → Developers → API keys:

- `STRIPE_SECRET_KEY` — `sk_test_…` (server only)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — `pk_test_…` (not required for Checkout redirect, but keep it for later Elements)

Copy `.env.example` to `.env.local` and paste the keys. Never put `sk_` in client code or commit it.

### 3. Create the 4 products / prices

**Option A — script**

```bash
export STRIPE_SECRET_KEY=sk_test_…
node scripts/create-stripe-products.mjs
```

Paste the printed `STRIPE_PRICE_*` lines into `.env.local`.

**Option B — Dashboard**

Create one-time USD prices:

| Product | Amount | Env var |
|---|---|---|
| Debt Payoff Tracker spreadsheet | $14 | `STRIPE_PRICE_DEBT` |
| Paycheck Budget + Bill Tracker spreadsheet | $14 | `STRIPE_PRICE_PAYCHECK` |
| Cash Flow Forecast spreadsheet | $14 | `STRIPE_PRICE_CASHFLOW` |
| All 3 Spreadsheet Bundle | $29 | `STRIPE_PRICE_BUNDLE` |
| Harbor Pro | $19 | `STRIPE_PRICE_PRO` |

Restart `npm run dev` after changing env vars.

Prices in the UI come from `src/config/pricing.ts` (`PRICES`). Stripe Price IDs come from env vars listed in `STRIPE_PRICE_ENV` in that same file.

### 4. Test a purchase

1. Click **Get the Full Spreadsheet — $14** (or the bundle).
2. You should land on Checkout (`checkout.stripe.com`).
3. Pay with `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP.
4. Success URL: `/success?session_id={CHECKOUT_SESSION_ID}`. Downloads appear only after the server confirms `payment_status = paid`.
5. Cancel returns to `/cancel` with a link back to templates.

### 5. Webhooks (local)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Put the `whsec_…` value in `STRIPE_WEBHOOK_SECRET`. The endpoint verifies the signature and records `checkout.session.completed` in `.data/purchases.json` (gitignored). The success page also confirms the session server-side, so downloads work even if the CLI isn’t running.

Trigger a test event:

```bash
stripe trigger checkout.session.completed
```

### 6. Switch to live keys later

1. Turn off Test mode in the Dashboard.
2. Create the same 4 products in live mode (or copy them).
3. Replace `.env.local` with `sk_live_…`, `pk_live_…`, live `price_…` IDs, and a live webhook secret pointing at `https://your-domain/api/webhooks/stripe`.
4. Set `NEXT_PUBLIC_SITE_URL` to the production origin.

## Spreadsheet files

Real `.xlsx` files live in `content/spreadsheets/` and are served only by `/api/download/[slug]` after a paid session (httpOnly entitlement cookie). They are not in `public/`.

| Offer | File |
|---|---|
| Debt Payoff | `content/spreadsheets/Debt-Payoff-Tracker-Schedule.xlsx` |
| Paycheck Budget | `content/spreadsheets/Paycheck-Budget-Bill-Tracker.xlsx` |
| Cash Flow Forecast | `content/spreadsheets/Cash-Flow-Forecast.xlsx` |

Replace those files in place to update what customers download. A bundle purchase unlocks all three.

## Restore a purchase

Pro and templates unlock in the browser after Stripe Checkout. To use them on a new phone or laptop:

1. Open `/restore`
2. Enter the **email from the Stripe receipt**
3. Open the magic link (emailed when `RESEND_API_KEY` is set; otherwise the Restore page shows the link)

The link is one-time and expires in 30 minutes. No password.

## Harbor Pro

Pro ($19) is a one-time Stripe Checkout unlock (save plans, CSV, comparison). It does **not** include spreadsheet files. Price ID: `STRIPE_PRICE_PRO`. Use Restore to bring Pro to another device.

## Brand

Name and tagline: `src/config/brand.ts`. Dollar amounts and Stripe env mapping: `src/config/pricing.ts`.
