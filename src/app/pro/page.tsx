import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "../../config/brand";
import { formatPrice, PRICES } from "../../config/pricing";
import { Container } from "../../components/layout/Container";
import { UnlockProButton } from "../../components/monetization/UnlockProButton";
import { ButtonLink } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

const proPrice = formatPrice(PRICES.pro);
const sheetPrice = formatPrice(PRICES.spreadsheet);
const bundlePrice = formatPrice(PRICES.bundle);

export const metadata: Metadata = {
  title: "Harbor Pro",
  description: `Harbor Pro is ${proPrice} once. Save named plans, export CSV, print reports, and compare Snowball vs Avalanche in the browser. Spreadsheet files are separate.`,
};

const included = [
  "Unlimited named saved plans in this browser",
  "CSV export and a print-friendly report",
  "Full Snowball vs Avalanche comparison (debt-free date and interest)",
  "Cash flow forecast out to 24 months (free stops at 12)",
  "More than 8 debts (free plans stop at 8)",
  "Quieter spreadsheet prompts on the calculators",
];

const notIncluded = [
  `Excel or Google Sheets files (${sheetPrice} each, or the 3 core workbooks for ${bundlePrice})`,
  "A subscription, or an account password",
  "Moving saved plan names and numbers to another device",
];

const rows: { label: string; free: string; pro: string; files: string }[] = [
  {
    label: "What it is",
    free: "All three calculators, no account",
    pro: "The same calculators, with save, export, and the longer views",
    files: "The Excel and Google Sheets workbooks",
  },
  {
    label: "Saved plans",
    free: "Not included",
    pro: "Named plans in this browser",
    files: "The file is yours after you download it",
  },
  {
    label: "Debt payoff",
    free: "Snowball or Avalanche, up to 8 debts. No side-by-side table",
    pro: "More than 8 debts, plus the full Snowball vs Avalanche table",
    files: "Sold separately",
  },
  {
    label: "Cash flow",
    free: "3, 6, or 12 months",
    pro: "Also 24 months",
    files: "Sold separately",
  },
  {
    label: "Price",
    free: "Free",
    pro: `${proPrice} once`,
    files: `${sheetPrice} each, or ${bundlePrice} for the 3 core files`,
  },
];

export default function ProPage() {
  return (
    <Container className="py-14">
      <p className="text-sm font-medium uppercase tracking-wide text-teal">Harbor Pro</p>
      <h1 className="mt-2 max-w-3xl font-serif text-4xl tracking-tight text-ink sm:text-5xl">
        Save the plan. Compare both payoff methods. {proPrice} once.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Harbor Pro unlocks saved plans, CSV export, and print reports in the browser. It is not a subscription, and
        it does not include the spreadsheet files.
      </p>

      <Card className="mt-8 max-w-xl p-6">
        <p className="text-sm font-medium text-teal">One-time</p>
        <p className="mt-1 font-serif text-4xl text-navy">{proPrice}</p>
        <p className="mt-1 text-sm text-muted">Pay once with Stripe. Pro unlocks in this browser.</p>
        <div className="mt-6">
          <UnlockProButton label={`Unlock Pro — ${proPrice} once`} size="lg" />
        </div>
        <p className="mt-3 text-xs text-muted">
          Secure checkout by Stripe. No account. On another device, open Restore and use the email from your receipt.
        </p>
      </Card>

      <h2 className="mt-14 font-serif text-2xl text-ink">What Pro adds</h2>
      <ul className="mt-4 max-w-2xl space-y-2 text-sm text-ink">
        {included.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>

      <h2 className="mt-14 font-serif text-2xl text-ink">What Pro does not include</h2>
      <ul className="mt-4 max-w-2xl space-y-2 text-sm text-ink">
        {notIncluded.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
      <p className="mt-4 max-w-2xl text-sm text-muted">
        Saved plans stay on the device that saved them. Restore brings Pro back, not the plan names and numbers from
        another phone. Email a snapshot from a calculator if you want a copy outside this browser.
      </p>

      <h2 className="mt-14 font-serif text-2xl text-ink">Free, Pro, or the files</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        The calculators stay free. Pro is for the browser. The workbooks are a separate purchase, and they stack —
        Pro plus the 3-file bundle is two one-time checkouts ({proPrice} and {bundlePrice}), not one product.
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="py-2 pr-4 font-medium">Compare</th>
              <th className="py-2 pr-4 font-medium">Free</th>
              <th className="py-2 pr-4 font-medium">Harbor Pro</th>
              <th className="py-2 font-medium">Spreadsheet files</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-line-soft align-top">
                <th className="py-3 pr-4 font-medium text-ink">{row.label}</th>
                <td className="py-3 pr-4 text-muted">{row.free}</td>
                <td className="py-3 pr-4 text-ink">{row.pro}</td>
                <td className="py-3 text-muted">{row.files}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/tools/debt-payoff" variant="secondary">
          Try the debt calculator
        </ButtonLink>
        <ButtonLink href="/templates" variant="secondary">
          See the spreadsheet files
        </ButtonLink>
        <ButtonLink href="/pricing" variant="ghost">
          All prices
        </ButtonLink>
      </div>

      <p className="mt-10 text-xs text-muted">
        Questions:{" "}
        <a href={`mailto:${brand.supportEmail}`} className="text-navy underline-offset-2 hover:underline">
          {brand.supportEmail}
        </a>
        . Already paid?{" "}
        <Link href="/restore" className="text-navy underline-offset-2 hover:underline">
          Restore
        </Link>
        . {brand.name} is a planning tool, not financial advice.
      </p>
    </Container>
  );
}
