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
      const data = (await res.json()) as {
        error?: string;
        message?: string;
        restoreUrl?: string;
        emailed?: boolean;
      };
      if (!res.ok) {
        setError(data.error ?? "Could not start restore.");
        return;
      }
      setMessage(
        data.emailed
          ? "Check that inbox for a restore link. It expires in 30 minutes."
          : (data.message ?? "If we find a purchase, use the link below."),
      );
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
        Use the same email you entered at Stripe Checkout. We’ll send a one-time link. No password.
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
          {busy ? "Checking…" : "Email me a restore link"}
        </Button>
      </form>
      {message ? <p className="mt-6 text-sm text-ink">{message}</p> : null}
      {restoreUrl ? (
        <p className="mt-3 text-sm text-muted">
          Email sending isn’t configured yet, so here’s your link — open it on the phone or computer you want to
          use.{" "}
          <a href={restoreUrl} className="font-medium text-navy underline-offset-2 hover:underline">
            Restore on this device
          </a>
        </p>
      ) : null}
    </Container>
  );
}
