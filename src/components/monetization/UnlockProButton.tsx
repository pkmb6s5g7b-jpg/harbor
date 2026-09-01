"use client";

import { useState } from "react";
import { formatPrice, PRICES } from "../../config/pricing";
import { goToStripeCheckout, startStripeCheckout } from "../../lib/commerce/start-checkout";
import { useHarbor } from "../providers/HarborProvider";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

export function UnlockProButton({
  label,
  size = "md",
  className = "",
}: {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { isPro } = useHarbor();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (isPro) {
    return <Badge tone="teal">Pro is unlocked in this browser</Badge>;
  }

  async function buy() {
    setError("");
    setBusy(true);
    const { url, error: nextError } = await startStripeCheckout("pro");
    if (url) {
      goToStripeCheckout(url);
      return;
    }
    setError(nextError ?? "Could not start checkout.");
    setBusy(false);
  }

  return (
    <div className={className}>
      <Button type="button" size={size} className="w-full sm:w-auto" disabled={busy} onClick={buy}>
        {busy ? "Redirecting to Stripe…" : (label ?? `Unlock Pro — ${formatPrice(PRICES.pro)}`)}
      </Button>
      {error ? <p className="mt-2 text-xs text-red-fg">{error}</p> : null}
    </div>
  );
}
