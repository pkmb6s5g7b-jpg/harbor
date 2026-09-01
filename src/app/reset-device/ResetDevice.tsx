"use client";

import { useEffect, useState } from "react";
import { Container } from "../../components/layout/Container";
import { ButtonLink } from "../../components/ui/Button";
import { localStorageAdapter } from "../../lib/storage/local";

export function ResetDevice() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await fetch("/api/entitlements", { method: "DELETE" });
        localStorageAdapter.clearDevice();
        window.dispatchEvent(new Event("harbor-pro"));
        window.dispatchEvent(new Event("harbor-buy"));
        if (!cancelled) setDone(true);
      } catch {
        if (!cancelled) setError("Could not clear this browser. Try again.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Container className="max-w-xl py-14">
      <p className="text-sm font-medium uppercase tracking-wide text-teal">Test helper</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">
        {done ? "This browser is cleared." : "Clearing this browser…"}
      </h1>
      <p className="mt-3 text-muted">
        Pro and template unlocks on <span className="font-medium">this device only</span> are gone. Your Stripe test
        payments still exist — you can buy again, or use Restore with your receipt email.
      </p>
      {error ? <p className="mt-4 text-sm text-red-fg">{error}</p> : null}
      {done ? (
        <div className="mt-8 flex flex-wrap gap-2">
          <ButtonLink href="/pricing">Unlock Pro</ButtonLink>
          <ButtonLink href="/spreadsheets" variant="secondary">
            Buy a template
          </ButtonLink>
        </div>
      ) : null}
    </Container>
  );
}
