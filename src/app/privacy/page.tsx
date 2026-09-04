import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "../../config/brand";
import { Container } from "../../components/layout/Container";

export const metadata: Metadata = {
  title: "Privacy",
  description: `How ${brand.name} handles calculator numbers, purchases, and email.`,
};

export default function PrivacyPage() {
  return (
    <Container className="max-w-3xl py-14">
      <p className="text-sm font-medium uppercase tracking-wide text-teal">Legal</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">Privacy</h1>
      <p className="mt-3 text-sm text-muted">Last updated September 2, 2026. Site: {brand.url}</p>

      <div className="mt-8 space-y-8 text-muted">
        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-ink">What this site is</h2>
          <p>
            {brand.name} is a planning site: free calculators in your browser, optional Harbor Pro, and paid Excel /
            Google Sheets templates. It is not a bank. It does not connect to your accounts or import transactions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-ink">Numbers you type</h2>
          <p>
            Debts, paychecks, bills, and forecasts stay in this browser (including drafts, saved plans if you have
            Pro, and optional reviews). We do not use those figures to train models or to sell ads. Clearing site
            data, switching browsers, or using another device removes them unless you saved a plan here or emailed a
            snapshot.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-ink">Purchases</h2>
          <p>
            Payments run through Stripe. Stripe receives the card details, the amount, and the email you enter at
            checkout. {brand.name} never sees your full card number. After a paid checkout we store an unlock cookie
            in this browser and remember which products that receipt email paid for, so you can{" "}
            <Link href="/restore" className="font-medium text-navy underline-offset-2 hover:underline">
              Restore
            </Link>{" "}
            on another device. Read Stripe’s policy at{" "}
            <a
              href="https://stripe.com/privacy"
              className="font-medium text-navy underline-offset-2 hover:underline"
            >
              stripe.com/privacy
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-ink">Email</h2>
          <p>
            Email is optional except at Stripe Checkout if you buy something. If you click Email me my results, we send
            that snapshot to the address you enter. Restore looks up paid checkouts for an address and shows a one-time
            link on the page — we don’t email the restore link.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-ink">Hosting and cookies</h2>
          <p>
            The site is hosted on Vercel. Vercel may log standard request data (such as IP address and pages visited)
            to run the site. We set a small httpOnly cookie after a purchase so Downloads works in this browser. We
            do not use advertising cookies or a third-party analytics pixel.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-ink">What we don’t do</h2>
          <p>
            We don’t sell your personal information. We don’t share calculator inputs with other companies. We don’t
            require an account or password.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-ink">Children</h2>
          <p>{brand.name} is not directed at children under 13. Don’t use it to submit a child’s personal information.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-ink">Questions</h2>
          <p>
            There is no separate support inbox yet. For a purchase, use the email on your Stripe receipt and{" "}
            <Link href="/restore" className="font-medium text-navy underline-offset-2 hover:underline">
              Restore
            </Link>
            . See also{" "}
            <Link href="/terms" className="font-medium text-navy underline-offset-2 hover:underline">
              Terms
            </Link>
            .
          </p>
        </section>
      </div>
    </Container>
  );
}
