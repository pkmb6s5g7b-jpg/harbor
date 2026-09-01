"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice, type Offer } from "../../config/pricing";
import { Button } from "../ui/Button";
import { Field, Input } from "../ui/Input";
import { Modal } from "../ui/Modal";

export function MockCheckout({
  open,
  offer,
  onClose,
  onPaid,
}: {
  open: boolean;
  offer: Offer | null;
  onClose: () => void;
  onPaid: (grants: string[], email: string, name?: string) => Promise<void>;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const isPro = offer?.kind === "pro";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!offer) return;
    if (!email.includes("@")) {
      setError("Enter a valid email so we can send your receipt later.");
      return;
    }
    setError("");
    setBusy(true);
    await onPaid(offer.grants, email.trim(), name.trim() || undefined);
    setBusy(false);
    setDone(true);
  }

  function close() {
    const goDownloads = done && offer && offer.kind !== "pro";
    setDone(false);
    setError("");
    onClose();
    if (goDownloads) router.push("/downloads?paid=1");
  }

  if (!offer) return null;

  return (
    <Modal
      open={open}
      onClose={close}
      title={done ? (isPro ? "Harbor Pro is on" : "Payment successful") : offer.name}
    >
      {done ? (
        <div>
          {isPro ? (
            <p className="text-sm text-muted">
              Pro is unlocked in this browser. You can save named plans, export CSV, and print a cleaner report.
              Spreadsheet files are separate — buy a template or the bundle when you want the workbooks.
            </p>
          ) : (
            <p className="text-sm text-muted">
              Paid customers get instant download. Your templates are on the next page.
            </p>
          )}
          <Button
            className="mt-5 w-full"
            onClick={() => {
              if (!isPro) {
                onClose();
                router.push("/downloads?paid=1");
                setDone(false);
              } else {
                close();
              }
            }}
          >
            {isPro ? "Continue" : "Download your templates"}
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="rounded-xl bg-page p-4">
            <p className="font-serif text-3xl text-navy">{formatPrice(offer.price)}</p>
            <p className="text-sm text-muted">One-time. No subscription.</p>
          </div>
          <p className="text-sm text-ink">{offer.blurb}</p>
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </Field>
          {error ? <p className="text-sm text-red-fg">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Working…" : isPro ? "Unlock Pro" : `Pay ${formatPrice(offer.price)}`}
          </Button>
          <p className="text-xs text-muted">
            Preview checkout — no card is charged. Swap this modal for Stripe Checkout by setting STRIPE_SECRET_KEY
            (see src/config/pricing.ts).
          </p>
        </form>
      )}
    </Modal>
  );
}
