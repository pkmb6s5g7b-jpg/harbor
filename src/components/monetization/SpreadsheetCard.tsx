"use client";

import { formatPrice, PRICES, templateOffer } from "../../config/pricing";
import { goToStripeCheckout, startStripeCheckout } from "../../lib/commerce/start-checkout";
import { getProduct } from "../../data/products";
import { useHarbor } from "../providers/HarborProvider";
import { ButtonLink } from "../ui/Button";
import { Card } from "../ui/Card";
import { BuyButton } from "./BuyButton";

export function SpreadsheetCard({
  productId,
  light,
}: {
  productId: string | null;
  light?: boolean;
}) {
  const { isPro, hasTemplate } = useHarbor();
  if (!productId) return null;

  const product = getProduct(productId);
  if (!product) return null;

  const offer = templateOffer(product.id, product.name, product.blurb);
  const owned = hasTemplate(product.id);

  if (owned) {
    return (
      <Card className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-teal">Your template</p>
        <h3 className="mt-1 font-serif text-lg text-ink">{product.name}</h3>
        <ButtonLink href="/downloads" variant="teal" className="mt-4 w-full">
          Download Excel + Google Sheets version
        </ButtonLink>
      </Card>
    );
  }

  if (light || isPro) {
    return (
      <p className="text-sm text-muted">
        Prefer the full workbook?{" "}
        <button
          type="button"
          className="font-medium text-navy underline-offset-2 hover:underline"
          onClick={async () => {
            const { url } = await startStripeCheckout(product.id);
            if (url) goToStripeCheckout(url);
          }}
        >
          {product.name} — {formatPrice(PRICES.spreadsheet)}
        </button>
        . Web tools stay free.
      </p>
    );
  }

  return (
    <Card className="p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-teal">Full spreadsheet — paid</p>
      <h3 className="mt-1 font-serif text-lg text-ink">Like this result?</h3>
      <p className="mt-1 text-sm text-muted">
        Get the full spreadsheet with extra sheets, dashboards, and reusable tracking. The calculator stays free.
      </p>
      <ul className="mt-3 space-y-1 text-sm text-ink">
        {product.highlights.map((h) => (
          <li key={h}>• {h}</li>
        ))}
      </ul>
      <BuyButton offer={offer} className="mt-4 w-full" />
      <p className="mt-2 text-center text-xs text-muted">
        Or the all-3 bundle for {formatPrice(PRICES.bundle)}.{" "}
        <a href="/spreadsheets" className="text-navy underline-offset-2 hover:underline">
          See templates
        </a>
      </p>
    </Card>
  );
}
