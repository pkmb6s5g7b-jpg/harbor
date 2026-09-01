"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { formatPrice, offers, PRICES } from "../../config/pricing";
import { products } from "../../data/products";
import { Container } from "../../components/layout/Container";
import { BuyButton } from "../../components/monetization/BuyButton";
import { useHarbor } from "../../components/providers/HarborProvider";
import { ButtonLink } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

function DownloadsInner() {
  const params = useSearchParams();
  const paid = params.get("paid") === "1";
  const { hasTemplate, isPro } = useHarbor();
  const owned = products.filter((p) => p.fileName && hasTemplate(p.id));

  return (
    <Container className="py-14">
      <p className="text-sm font-medium uppercase tracking-wide text-teal">
        {paid ? "Payment successful" : "Your templates"}
      </p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">
        {paid ? "Download your templates." : "Downloads"}
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        Paid customers get instant download. Open the .xlsx in Excel, or upload it to Google Drive and open with
        Google Sheets.
      </p>
      {isPro ? (
        <p className="mt-2 text-sm text-teal-dark">Pro is on in this browser. Spreadsheet files are a separate purchase.</p>
      ) : (
        <p className="mt-2 text-sm text-muted">
          Paid on another device?{" "}
          <a href="/restore" className="font-medium text-navy underline-offset-2 hover:underline">
            Restore with your receipt email
          </a>
          .
        </p>
      )}

      {owned.length === 0 ? (
        <Card className="mt-8 p-6">
          <p className="font-medium text-ink">No templates unlocked yet.</p>
          <p className="mt-1 text-sm text-muted">
            The three calculators stay free. Buy a workbook when you want the extra sheets and a file you can keep.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <BuyButton offer={offers["core-bundle"]} label={`Get the bundle — ${formatPrice(PRICES.bundle)}`} />
            <ButtonLink href="/restore" variant="secondary">
              Restore a purchase
            </ButtonLink>
          </div>
        </Card>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {owned.map((p) => (
            <Card key={p.id} className="p-5">
              <h2 className="font-serif text-lg text-ink">{p.name}</h2>
              <p className="mt-1 text-sm text-muted">{p.blurb}</p>
              <a
                href={`/api/download/${p.id}`}
                className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-teal px-4 text-sm font-medium text-white hover:bg-teal-dark"
              >
                Download Excel + Google Sheets version
              </a>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}

export function DownloadsClient() {
  return (
    <Suspense>
      <DownloadsInner />
    </Suspense>
  );
}
