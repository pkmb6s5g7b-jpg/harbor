import type { Metadata } from "next";
import Link from "next/link";
import { tools } from "../../data/tools";
import { Container } from "../../components/layout/Container";
import { ButtonLink } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

export const metadata: Metadata = {
  title: "Tools",
  description: "Free calculators for debt payoff, paycheck budgeting, and cash flow. No account required.",
};

export default function ToolsPage() {
  return (
    <Container className="py-14">
      <p className="text-sm font-medium uppercase tracking-wide text-teal">Tools</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">Free calculators. Pick one to start.</h1>
      <p className="mt-3 max-w-2xl text-muted">
        No account. Sample data is already filled in so you can see a real plan, then swap in your numbers. Spreadsheet
        templates are paid and separate.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {tools.map((t) => (
          <Card key={t.slug} className="flex flex-col p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-teal">{t.shortName}</p>
            <h2 className="mt-2 font-serif text-2xl text-ink">{t.name}</h2>
            <p className="mt-2 flex-1 text-sm text-muted">{t.blurb}</p>
            <ButtonLink href={t.href} className="mt-6 w-full">
              Open free calculator
            </ButtonLink>
          </Card>
        ))}
      </div>

      <p className="mt-10 text-sm text-muted">
        Want the Excel & Google Sheets version after you run a plan?{" "}
        <Link href="/spreadsheets" className="font-medium text-navy underline-offset-2 hover:underline">
          See paid templates
        </Link>
        .
      </p>
    </Container>
  );
}
