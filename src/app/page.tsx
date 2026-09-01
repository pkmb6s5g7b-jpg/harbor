import Link from "next/link";
import { brand } from "../config/brand";
import { formatPrice, offers, PRICES, templateOffer } from "../config/pricing";
import { coreProducts } from "../data/products";
import { BuyButton } from "../components/monetization/BuyButton";
import { tools } from "../data/tools";
import { Container } from "../components/layout/Container";
import { ButtonLink } from "../components/ui/Button";
import { ReviewsSection } from "../components/marketing/Reviews";
import { featuredReviews } from "../data/reviews";
import { Card } from "../components/ui/Card";

const steps = [
  {
    n: "01",
    title: "Enter a few numbers",
    body: "Sample data is already filled in. Swap it for yours — or just poke around.",
  },
  {
    n: "02",
    title: "See the plan",
    body: "Dates, leftover, and the months that would go red. Built to read in a glance.",
  },
  {
    n: "03",
    title: "Keep going",
    body: "Email the snapshot (optional), buy the spreadsheet if you want the file, or unlock Pro in the browser.",
  },
];

export default function HomePage() {

  return (
    <>
      <section className="border-b border-line-soft bg-white">
        <Container className="grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-teal">Free calculators</p>
            <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight text-ink sm:text-5xl">
              See where your money goes — then make a plan.
            </h1>
            <p className="mt-4 max-w-lg text-lg text-muted">{brand.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/tools/paycheck-budget" size="lg">
                Try a calculator
              </ButtonLink>
              <ButtonLink href="/spreadsheets" variant="secondary" size="lg">
                Paid templates
              </ButtonLink>
            </div>
            <p className="mt-6 max-w-lg text-sm text-muted">
              “I finally saw leftover after bills, not after a monthly guess.”{" "}
              <Link href="/reviews" className="font-medium text-navy hover:underline">
                Maya R. — Paycheck Budget
              </Link>
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="bg-card-teal p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-teal-dark">Left after bills</p>
              <p className="mt-2 font-serif text-3xl tabular text-teal-dark">$804.00</p>
              <p className="mt-1 text-sm text-muted">This bi-weekly paycheck</p>
            </Card>
            <Card className="bg-green-bg p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-green-fg">Left after the plan</p>
              <p className="mt-2 font-serif text-3xl tabular text-green-fg">$199.00</p>
              <p className="mt-1 text-sm text-muted">Bills + categories</p>
            </Card>
            <Card className="p-5 sm:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-navy">Debt-free</p>
              <p className="mt-2 font-serif text-3xl text-navy">September 2031</p>
              <p className="mt-1 text-sm text-muted">Snowball · $200 extra · $4,591 interest</p>
            </Card>
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-14">
          <h2 className="font-serif text-3xl tracking-tight">Three tools. No account.</h2>
          <p className="mt-2 max-w-xl text-muted">
            Use them in the browser, free. The full Excel and Google Sheets templates are paid.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {tools.map((t) => (
              <Link key={t.slug} href={t.href} className="group">
                <Card className="h-full p-6 transition-shadow group-hover:shadow-md">
                  <p className="text-xs font-medium uppercase tracking-wide text-teal">{t.shortName}</p>
                  <h3 className="mt-2 font-serif text-xl text-ink">{t.name}</h3>
                  <p className="mt-2 text-sm text-muted">{t.blurb}</p>
                  <p className="mt-4 text-sm font-medium text-navy">Open free calculator →</p>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-line-soft bg-white">
        <Container className="py-14">
          <h2 className="font-serif text-3xl tracking-tight">How it works</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n}>
                <p className="font-serif text-2xl text-navy/40">{s.n}</p>
                <h3 className="mt-2 font-medium text-ink">{s.title}</h3>
                <p className="mt-1 text-sm text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <ReviewsSection reviews={featuredReviews} />

      <section>
        <Container className="py-14">
          <h2 className="font-serif text-3xl tracking-tight">Want the version you keep using every month?</h2>
          <p className="mt-2 max-w-xl text-muted">
            Same math as the calculators. Logs, due dates, and the tabs a one-screen tool can’t hold.{" "}
            {formatPrice(PRICES.spreadsheet)} each, or all three for {formatPrice(PRICES.bundle)}.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {coreProducts.map((p) => (
              <Card key={p.id} className="flex flex-col p-5">
                <h3 className="font-serif text-lg text-ink">{p.name}</h3>
                <p className="mt-2 flex-1 text-sm text-muted">{p.blurb}</p>
                <BuyButton
                  offer={templateOffer(p.id, p.name, p.blurb)}
                  className="mt-4 w-full"
                />
              </Card>
            ))}
          </div>
          <div className="mt-6">
            <BuyButton
              offer={offers["core-bundle"]}
              variant="primary"
              label={`Get all 3 — ${formatPrice(PRICES.bundle)}`}
            />
          </div>
        </Container>
      </section>

      <section className="border-t border-line-soft bg-navy text-white">
        <Container className="flex flex-col items-start justify-between gap-6 py-12 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-serif text-2xl">Harbor Pro — {brand.proPriceLabel} once</h2>
            <p className="mt-1 text-sm text-white/80">
              Save named plans, export reports, compare Snowball vs Avalanche. Still no subscription.
            </p>
          </div>
          <ButtonLink href="/pricing" variant="secondary">
            See what’s included
          </ButtonLink>
        </Container>
      </section>
    </>
  );
}
