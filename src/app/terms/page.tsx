import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "../../config/brand";
import { formatPrice, PRICES } from "../../config/pricing";
import { Container } from "../../components/layout/Container";

export const metadata: Metadata = {
  title: "Terms",
  description: `Terms for using ${brand.name} calculators, Harbor Pro, and paid spreadsheet templates.`,
};

export default function TermsPage() {
  return (
    <Container className="max-w-3xl py-14">
      <p className="text-sm font-medium uppercase tracking-wide text-teal">Legal</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">Terms</h1>
      <p className="mt-3 text-sm text-muted">Last updated September 2, 2026. Site: {brand.url}</p>

      <div className="mt-8 space-y-8 text-muted">
        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-ink">Using the calculators</h2>
          <p>
            The three tools are free to use in your browser. No account is required. Results are planning estimates,
            not financial, tax, or legal advice. If a minimum payment doesn’t cover interest, that is a math warning,
            not a recommendation.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-ink">What you buy</h2>
          <p>
            Harbor Pro ({formatPrice(PRICES.pro)}, one-time) unlocks saved plans, CSV export, and related web-tool
            extras in the browser. It does not include spreadsheet files. Templates are {formatPrice(PRICES.spreadsheet)}{" "}
            each, or {formatPrice(PRICES.bundle)} for the three core workbooks. Pro and templates are separate and can
            stack. All paid items are one-time digital goods, not a subscription.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-ink">Payments</h2>
          <p>
            Checkout is handled by Stripe. Use the same email at Checkout if you want to restore later. After you pay,
            this browser unlocks. On a new phone or laptop, open{" "}
            <Link href="/restore" className="font-medium text-navy underline-offset-2 hover:underline">
              Restore
            </Link>{" "}
            with that receipt email. Card data is processed by Stripe, not stored on {brand.name}.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-ink">Files and license</h2>
          <p>
            Spreadsheet templates are for your personal or household use. Don’t resell, republish, or share the file
            as if it were your product. The free calculators may be used without buying a template.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-ink">Refunds</h2>
          <p>
            Templates can be downloaded as soon as you pay. If a charge was a duplicate or a clear mistake, we will
            try to make it right. Start from your Stripe receipt (it identifies the payment) or Restore with that
            email. We can’t reverse a download you already made onto another computer, but we don’t want anyone stuck
            with a bad test or double charge.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-ink">Plans stay in the browser</h2>
          <p>
            Named saved plans live on the device that saved them. Restore brings back Pro and template access, not
            the plan names and numbers from another phone. Email a snapshot if you want a copy outside this browser.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-ink">Availability</h2>
          <p>
            We aim to keep the site up, but hosting can fail. Paid files are yours to keep after download. We may
            change prices or features; that does not take away a purchase you already made.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-ink">Privacy</h2>
          <p>
            How we handle numbers, email, and Stripe is described in{" "}
            <Link href="/privacy" className="font-medium text-navy underline-offset-2 hover:underline">
              Privacy
            </Link>
            .
          </p>
        </section>
      </div>
    </Container>
  );
}
