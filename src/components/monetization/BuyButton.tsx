"use client";

import { useState } from "react";
import { formatPrice, STRIPE_CHECKOUT_OFFER_IDS, type Offer } from "../../config/pricing";
import { goToStripeCheckout } from "../../lib/commerce/start-checkout";
import { useHarbor } from "../providers/HarborProvider";
import { Button, ButtonLink } from "../ui/Button";

export function BuyButton({
  offer,
  label,
  variant = "teal",
  className = "",
  size = "md",
}: {
  offer: Offer;
  label?: string;
  variant?: "primary" | "secondary" | "teal";
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const { hasTemplate, isPro, openCheckout } = useHarbor();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const owned = offer.kind === "pro" ? isPro : offer.grants.every((g) => hasTemplate(g));
  const usesStripe = (STRIPE_CHECKOUT_OFFER_IDS as readonly string[]).includes(offer.id);

  if (owned) {
    if (offer.kind === "pro") {
      return (
        <p className={`text-sm font-medium text-teal-dark ${className}`}>Pro is unlocked in this browser</p>
      );
    }
    return (
      <ButtonLink href="/downloads" variant={variant} size={size} className={className}>
        Download your templates
      </ButtonLink>
    );
  }

  async function startStripe() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId: offer.id }),
      });
      const data = (await res.json()) as { url?: string; error?: string; mode?: string };
      if (data.url) {
        goToStripeCheckout(data.url);
        return;
      }
      if (data.mode === "placeholder") {
        openCheckout(offer.id);
        return;
      }
      setError(data.error ?? "Could not start checkout.");
    } catch {
      setError("Could not start checkout. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      <Button
        type="button"
        variant={variant}
        size={size}
        className="w-full"
        disabled={busy}
        onClick={() => (usesStripe ? startStripe() : openCheckout(offer.id))}
      >
        {busy ? "Redirecting to Stripe…" : (label ?? `Get the Full Spreadsheet — ${formatPrice(offer.price)}`)}
      </Button>
      {error ? <p className="mt-2 text-xs text-red-fg">{error}</p> : null}
    </div>
  );
}
