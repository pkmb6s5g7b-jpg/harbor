"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Container } from "../../../components/layout/Container";
import { ButtonLink } from "../../../components/ui/Button";
import { localStorageAdapter } from "../../../lib/storage/local";

export function RestoreConfirm() {
  const params = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "ok" | "error">(token ? "loading" : "error");
  const [message, setMessage] = useState(
    token ? "" : "This restore link is missing. Request a new one.",
  );
  const [pro, setPro] = useState(false);
  const [fileCount, setFileCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/restore/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          grants?: string[];
          pro?: boolean;
          files?: { id: string }[];
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok || !data.ok) {
          setStatus("error");
          setMessage(data.error ?? "This restore link is invalid or expired.");
          return;
        }
        if (data.grants?.length) {
          localStorageAdapter.addPurchases(data.grants);
          window.dispatchEvent(new Event("harbor-buy"));
        }
        if (data.pro) {
          localStorageAdapter.setPro(true);
          window.dispatchEvent(new Event("harbor-pro"));
          setPro(true);
        }
        setFileCount(data.files?.length ?? 0);
        setStatus("ok");
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Could not restore. Request a new link.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <Container className="max-w-xl py-14">
      {status === "loading" ? (
        <>
          <p className="text-sm font-medium uppercase tracking-wide text-teal">Restore</p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight">Bringing your purchase to this device…</h1>
        </>
      ) : null}
      {status === "ok" ? (
        <>
          <p className="text-sm font-medium uppercase tracking-wide text-teal">Restored</p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight">You’re back.</h1>
          <p className="mt-3 text-muted">
            {pro ? "Harbor Pro is on in this browser. " : ""}
            {fileCount > 0
              ? "Your spreadsheet templates are ready to download."
              : "Spreadsheet files are a separate purchase if you only unlocked Pro."}
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {fileCount > 0 ? (
              <ButtonLink href="/downloads">Go to downloads</ButtonLink>
            ) : (
              <ButtonLink href="/tools">Open a calculator</ButtonLink>
            )}
            <ButtonLink href="/pricing" variant="secondary">
              Pricing
            </ButtonLink>
          </div>
        </>
      ) : null}
      {status === "error" ? (
        <>
          <p className="text-sm font-medium uppercase tracking-wide text-amber-fg">Restore</p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight">That link didn’t work.</h1>
          <p className="mt-3 text-muted">{message}</p>
          <div className="mt-8">
            <ButtonLink href="/restore">Request a new link</ButtonLink>
          </div>
        </>
      ) : null}
    </Container>
  );
}
