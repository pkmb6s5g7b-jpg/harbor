"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Container } from "../../components/layout/Container";
import { ButtonLink } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { localStorageAdapter } from "../../lib/storage/local";

type FileRow = { id: string; name: string; fileName: string | null; blurb: string };

export function SuccessClient() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState<"loading" | "paid" | "unpaid" | "error">(
    sessionId ? "loading" : "error",
  );
  const [message, setMessage] = useState(
    sessionId ? "" : "Missing checkout session. If you paid, open Downloads from the menu.",
  );
  const [files, setFiles] = useState<FileRow[]>([]);
  const [proUnlocked, setProUnlocked] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/checkout/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        });
        const raw = await res.text();
        let data: { paid?: boolean; grants?: string[]; files?: FileRow[]; error?: string } = {};
        try {
          data = raw ? (JSON.parse(raw) as typeof data) : {};
        } catch {
          data = { error: `Could not confirm this payment (${res.status}).` };
        }
        if (cancelled) return;
        if (!res.ok || !data.paid) {
          setStatus(res.status === 402 ? "unpaid" : "error");
          setMessage(data.error ?? "We could not confirm this payment.");
          return;
        }
        if (data.grants?.length) {
          localStorageAdapter.addPurchases(data.grants);
          if (data.grants.includes("pro")) {
            localStorageAdapter.setPro(true);
            window.dispatchEvent(new Event("harbor-pro"));
            setProUnlocked(true);
          }
          window.dispatchEvent(new Event("harbor-buy"));
        }
        setFiles(data.files ?? []);
        setStatus("paid");
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Could not verify the payment. Refresh this page.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <Container className="py-14">
      {status === "loading" ? (
        <>
          <p className="text-sm font-medium uppercase tracking-wide text-teal">Checkout</p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight">Confirming your payment…</h1>
          <p className="mt-3 text-muted">This only takes a moment.</p>
        </>
      ) : null}

      {status === "paid" ? (
        <>
          <p className="text-sm font-medium uppercase tracking-wide text-teal">Payment successful</p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight">
            {proUnlocked && files.length === 0 ? "Harbor Pro is on." : "Download your templates."}
          </h1>
          {proUnlocked ? (
            <p className="mt-3 max-w-xl text-muted">
              You can save named plans, export CSV, and print a cleaner report in this browser. Spreadsheet files are
              still a separate purchase. On a new phone or laptop, use Restore with this same email.
            </p>
          ) : (
            <p className="mt-3 max-w-xl text-muted">
              Open the .xlsx in Excel, or upload it to Google Drive and open with Google Sheets. You can come back to
              Downloads in this browser.
            </p>
          )}
          {proUnlocked ? (
            <div className="mt-6 flex flex-wrap gap-2">
              <ButtonLink href="/tools">Open a calculator</ButtonLink>
              <ButtonLink href="/plans" variant="secondary">
                Saved plans
              </ButtonLink>
              <ButtonLink href="/spreadsheets" variant="secondary">
                Spreadsheet templates
              </ButtonLink>
            </div>
          ) : null}
          {files.length > 0 ? (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {files.map((p) => (
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
          ) : null}
        </>
      ) : null}

      {status === "unpaid" || status === "error" ? (
        <>
          <p className="text-sm font-medium uppercase tracking-wide text-amber-fg">Checkout</p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight">
            {status === "unpaid" ? "Payment not complete" : "We couldn’t confirm that payment"}
          </h1>
          <p className="mt-3 max-w-xl text-muted">{message}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <ButtonLink href="/spreadsheets">Back to templates</ButtonLink>
            <ButtonLink href="/downloads" variant="secondary">
              Downloads
            </ButtonLink>
          </div>
        </>
      ) : null}
    </Container>
  );
}
