"use client";

import { useState } from "react";
import { Container } from "../../components/layout/Container";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Input";

export function RestoreForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [restoreUrl, setRestoreUrl] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setRestoreUrl("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const raw = await res.text();
      let data: { error?: string; message?: string; restoreUrl?: string } = {};
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        data = { error: "Could not start restore." };
      }
      if (!res.ok) {
        setError(data.error ?? "Could not start restore.");
        return;
      }
      setMessage(data.message ?? "If we find a purchase, you’ll get a restore link here.");
      if (data.restoreUrl) setRestoreUrl(data.restoreUrl);
    } catch {
      setError("Could not start restore. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Container className="max-w-xl py-14">
      <p className="text-sm font-medium uppercase tracking-wide text-teal">Restore</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">Already paid? Bring it to this device.</h1>
      <p className="mt-3 text-muted">
        Use the same email you entered at Stripe Checkout. If we find a purchase, you’ll get a one-time link on this
        page. No password.
      </p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <Field label="Email from your receipt">
          <Input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        {error ? <p className="text-sm text-red-fg">{error}</p> : null}
        <Button type="submit" disabled={busy}>
          {busy ? "Checking…" : "Check this email"}
        </Button>
      </form>
      {message ? <p className="mt-6 text-sm text-ink">{message}</p> : null}
      {restoreUrl ? (
        <p className="mt-4">
          <a
            href={restoreUrl}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-navy px-4 text-sm font-medium text-white hover:bg-navy-deep"
          >
            Restore on this device
          </a>
        </p>
      ) : null}
    </Container>
  );
}
