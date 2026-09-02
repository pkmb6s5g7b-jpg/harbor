import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "../../config/brand";
import { Container } from "../../components/layout/Container";
import { ButtonLink } from "../../components/ui/Button";

export const metadata: Metadata = {
  title: "About",
  description: `What ${brand.name} is, what it isn’t, and how your numbers are handled.`,
};

export default function AboutPage() {
  return (
    <Container className="max-w-3xl py-14">
      <p className="text-sm font-medium uppercase tracking-wide text-teal">About</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">A calm place to plan your money.</h1>
      <div className="mt-8 space-y-6 text-muted">
        <p>
          {brand.name} is a small set of calculators for the questions people actually ask between paychecks: Can I
          pay this off? What’s left of this check? Will next spring go red?
        </p>
        <p>
          It is not a bank. It doesn’t connect to accounts, import transactions, or tell you what to buy. The three
          tools run in your browser. Plans stay here unless you choose to email a summary or unlock Pro to save them.
        </p>
        <p>
          The numbers are meant to match the paid Excel and Google Sheets workbooks — same Snowball / Avalanche
          waterfall, same leftover-after-bills cards. Use the free web tool to try a plan. Buy the spreadsheet when
          you want a log, due dates, or a file you can keep.
        </p>
        <p>
          Nothing here is financial advice. If a minimum payment doesn’t cover interest, the calculator will say so.
          That’s a math warning, not a product pitch.
        </p>
        <p>
          How we handle numbers, email, and Stripe is in{" "}
          <Link href="/privacy" className="font-medium text-navy underline-offset-2 hover:underline">
            Privacy
          </Link>
          . Buying Pro or a template is covered by{" "}
          <Link href="/terms" className="font-medium text-navy underline-offset-2 hover:underline">
            Terms
          </Link>
          .
        </p>
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/tools/paycheck-budget">Open a calculator</ButtonLink>
        <ButtonLink href="/templates" variant="secondary">
          Browse paid templates
        </ButtonLink>
      </div>
    </Container>
  );
}
