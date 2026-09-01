import type { Metadata } from "next";
import { formatPrice, offers, PRICES, templateOffer } from "../../config/pricing";
import { coreProducts, extraProducts } from "../../data/products";
import { Container } from "../../components/layout/Container";
import { BuyButton } from "../../components/monetization/BuyButton";
import { ButtonLink } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";

export const metadata: Metadata = {
  title: "Spreadsheet templates",
  description: `Paid Excel and Google Sheets templates. ${formatPrice(PRICES.spreadsheet)} each, or all 3 for ${formatPrice(PRICES.bundle)}. Web calculators stay free.`,
};

export default function SpreadsheetsPage() {
  return (
    <Container className="py-14">
      <p className="text-sm font-medium uppercase tracking-wide text-teal">Templates</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">Full spreadsheet templates — paid.</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Web tools are free. These workbooks are the keep-using versions: extra sheets, dashboards, and a file you
        open every payday. {formatPrice(PRICES.spreadsheet)} each, or all three for {formatPrice(PRICES.bundle)}.
      </p>

      <Card className="mt-8 border-navy/20 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge tone="teal">Best value</Badge>
            <h2 className="mt-2 font-serif text-2xl text-ink">{offers["core-bundle"].name}</h2>
            <p className="mt-1 max-w-xl text-sm text-muted">{offers["core-bundle"].blurb}</p>
            <p className="mt-2 text-sm text-ink">
              {formatPrice(PRICES.spreadsheet * 3)} if bought separately →{" "}
              <span className="font-medium text-navy">{formatPrice(PRICES.bundle)}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="font-serif text-4xl text-navy">{formatPrice(PRICES.bundle)}</p>
            <p className="text-xs text-muted">one-time</p>
            <BuyButton
              offer={offers["core-bundle"]}
              label={`Get the bundle — ${formatPrice(PRICES.bundle)}`}
              className="mt-3"
            />
          </div>
        </div>
      </Card>

      <h2 className="mt-12 font-serif text-2xl tracking-tight">The three templates</h2>
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {coreProducts.map((p) => (
          <Card key={p.id} className="flex flex-col p-6">
            <div id={p.id} className="scroll-mt-24 flex flex-1 flex-col">
              <Badge tone="teal">{formatPrice(PRICES.spreadsheet)}</Badge>
              <h3 className="mt-3 font-serif text-xl text-ink">{p.name}</h3>
              <p className="mt-2 flex-1 text-sm text-muted">{p.blurb}</p>
              <ul className="mt-4 space-y-1 text-sm text-ink">
                {p.highlights.map((h) => (
                  <li key={h}>• {h}</li>
                ))}
              </ul>
              <div className="mt-5 flex flex-col gap-2">
                <BuyButton offer={templateOffer(p.id, p.name, p.blurb)} className="w-full" />
                {p.relatedToolHref ? (
                  <ButtonLink href={p.relatedToolHref} variant="secondary" className="w-full">
                    Try the free calculator
                  </ButtonLink>
                ) : null}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="mt-14 font-serif text-2xl tracking-tight">Also available</h2>
      <p className="mt-2 text-sm text-muted">Same {formatPrice(PRICES.spreadsheet)} each. Not in the bundle.</p>
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {extraProducts.map((p) => (
          <Card key={p.id} className="p-6">
            <div id={p.id} className="scroll-mt-24">
              <h3 className="font-serif text-lg text-ink">{p.name}</h3>
              <p className="mt-2 text-sm text-muted">{p.blurb}</p>
              <BuyButton
                offer={templateOffer(p.id, p.name, p.blurb)}
                label={`Get the Full Spreadsheet — ${formatPrice(PRICES.spreadsheet)}`}
                className="mt-4 w-full"
              />
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-10 text-sm text-muted">
        After payment you’ll land on a download page. Google Sheets: upload the .xlsx to Drive → Open with Google
        Sheets. Harbor Pro ({formatPrice(PRICES.pro)}) is a separate one-time unlock for saving plans in the browser —
        it does not include these files.
      </p>
    </Container>
  );
}
