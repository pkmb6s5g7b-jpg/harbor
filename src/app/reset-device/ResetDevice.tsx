"use client";

import { useState } from "react";
import { Container } from "../../components/layout/Container";
import { Button, ButtonLink } from "../../components/ui/Button";
import { localStorageAdapter } from "../../lib/storage/local";

export function ResetDevice() {
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function clear() {
    setBusy(true);
    setError("");
    try {
      await fetch("/api/entitlements", { method: "DELETE" });
      localStorageAdapter.clearDevice();
      window.dispatchEvent(new Event("harbor-pro"));
      window.dispatchEvent(new Event("harbor-buy"));
      setDone(true);
    } catch {
      setError("Could not clear this browser. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Container className="max-w-xl py-14">
      <p className="text-sm font-medium uppercase tracking-wide text-teal">Test helper</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">
        {done ? "This browser is cleared." : "Clear this browser"}
      </h1>
      <p className="mt-3 text-muted">
        Local testing only. This removes Pro and template unlocks on{" "}
        <span className="font-medium">this device</span>. Stripe test payments stay — you can buy again, or Restore
        with your receipt email.
      </p>
      {error ? <p className="mt-4 text-sm text-red-fg">{error}</p> : null}
      {done ? (
        <div className="mt-8 flex flex-wrap gap-2">
          <ButtonLink href="/pricing">Unlock Pro</ButtonLink>
          <ButtonLink href="/templates" variant="secondary">
            Buy a template
          </ButtonLink>
        </div>
      ) : (
        <div className="mt-8">
          <Button type="button" disabled={busy} onClick={clear}>
            {busy ? "Clearing…" : "Clear Pro and templates"}
          </Button>
        </div>
      )}
    </Container>
  );
}
