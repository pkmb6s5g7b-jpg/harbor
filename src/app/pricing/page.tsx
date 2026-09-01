import type { Metadata } from "next";
import { brand } from "../../config/brand";
import { formatPrice, offers, PRICES, templateOffer } from "../../config/pricing";
import { coreProducts } from "../../data/products";
import { Container } from "../../components/layout/Container";
import { PricingActions } from "./PricingActions";
import { BuyButton } from "../../components/monetization/BuyButton";
import { ButtonLink } from "../../components/ui/Button";
import { ReviewsSection } from "../../components/marketing/Reviews";
import { pricingReviews } from "../../data/reviews";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";

export const metadata: Metadata = {
  title: "Pricing",
  description: `Free calculators. Harbor Pro ${formatPrice(PRICES.pro)}. Spreadsheet templates ${formatPrice(PRICES.spreadsheet)} each, or all 3 for ${formatPrice(PRICES.bundle)}.`,
};

const free = [
  "All three calculators, no account",
  "Sample plans you can edit",
  "Debt-free date, leftover, and cash-flow chart",
  "Optional: email yourself a snapshot",
];

const pro = [
  "Unlimited named saved plans in this browser",
  "CSV export and print-friendly reports",
  "Full Snowball vs Avalanche comparison",
  "24-month cash flow horizon",
  "More than 8 debts",
  "Quieter spreadsheet prompts",
];

const faqs = [
  {
    q: "Do I need an account?",
    a: "No password. Calculators are free. After you pay, use the email from your Stripe receipt on the Restore page to bring Pro or templates to another device.",
  },
  {
    q: "Is this a subscription?",
    a: "No. Everything is one-time.",
  },
  {
    q: "Does Pro include the spreadsheets?",
    a: "No. Pro is for the web tools (save, export, comparison). Spreadsheets are the Excel / Google Sheets files. Buy one template, the bundle, or both Pro and a template — they stack.",
  },
  {
    q: "What’s the difference vs the spreadsheet?",
    a: "The web tools are the 2-minute version, free. The workbooks add logs, due-date bills, 120-month engines, and the tabs you live in every month.",
  },
];

export default function PricingPage() {
  return (
    <Container className="py-14">
      <p className="text-sm font-medium uppercase tracking-wide text-teal">Pricing</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">Web tools free. Spreadsheets paid. Bundle best value.</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Use every calculator without an account. Unlock Pro if you want saved plans in the browser. Buy a template
        when you want the file.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <p className="text-sm font-medium text-muted">Calculators</p>
          <p className="mt-1 font-serif text-4xl text-ink">Free</p>
          <ul className="mt-6 space-y-2 text-sm text-ink">
            {free.map((f) => (
              <li key={f}>• {f}</li>
            ))}
          </ul>
          <ButtonLink href="/tools/paycheck-budget" variant="secondary" className="mt-6">
            Open a calculator
          </ButtonLink>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-teal">Harbor Pro</p>
          <p className="mt-1 font-serif text-4xl text-navy">{formatPrice(PRICES.pro)}</p>
          <p className="text-sm text-muted">One-time via Stripe. Unlocks in this browser. Does not include spreadsheet files.</p>
          <ul className="mt-6 space-y-2 text-sm text-ink">
            {pro.map((f) => (
              <li key={f}>• {f}</li>
            ))}
          </ul>
          <div className="mt-6">
            <PricingActions />
          </div>
        </Card>
        <Card className="border-navy/20 p-6">
          <Badge tone="teal">Best value for files</Badge>
          <p className="mt-2 text-sm font-medium text-teal">All 3 spreadsheet bundle</p>
          <p className="mt-1 font-serif text-4xl text-navy">{formatPrice(PRICES.bundle)}</p>
          <p className="text-sm text-muted">One-time. Instant download after payment.</p>
          <ul className="mt-6 space-y-2 text-sm text-ink">
            <li>• Debt Payoff Tracker</li>
            <li>• Paycheck Budget + Bill Tracker</li>
            <li>• Cash Flow Forecast</li>
            <li>• Excel + Google Sheets</li>
          </ul>
          <BuyButton
            offer={offers["core-bundle"]}
            label={`Get the bundle — ${formatPrice(PRICES.bundle)}`}
            className="mt-6 w-full"
          />
        </Card>
      </div>

      <h2 className="mt-16 font-serif text-2xl">Individual templates — {formatPrice(PRICES.spreadsheet)} each</h2>
      <p className="mt-2 text-muted">Same files as the bundle, sold one at a time.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {coreProducts.map((p) => (
          <Card key={p.id} className="p-5">
            <h3 className="font-medium text-ink">{p.name}</h3>
            <p className="mt-1 text-sm text-muted">{p.blurb}</p>
            <BuyButton
              offer={templateOffer(p.id, p.name, p.blurb)}
              label={`Get the Full Spreadsheet — ${formatPrice(PRICES.spreadsheet)}`}
              size="sm"
              className="mt-3"
            />
          </Card>
        ))}
      </div>

      <div className="mt-16">
        <ReviewsSection
          reviews={pricingReviews}
          contained={false}
          title="Why people pay once."
          intro="Pro for the browser. Templates for the file. Here’s what they said after."
        />
      </div>

      <h2 className="mt-16 font-serif text-2xl">Questions</h2>
      <dl className="mt-6 space-y-6">
        {faqs.map((f) => (
          <div key={f.q}>
            <dt className="font-medium text-ink">{f.q}</dt>
            <dd className="mt-1 text-sm text-muted">{f.a}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-8 text-xs text-muted">
        Template and Pro purchases go through Stripe Checkout. {brand.name} Pro is {formatPrice(PRICES.pro)} once and
        does not include the spreadsheet files.
      </p>
    </Container>
  );
}
