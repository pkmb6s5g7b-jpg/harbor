"use client";

import { useState } from "react";
import { Button } from "../ui/Button";
import { Field, Input } from "../ui/Input";
import { Modal } from "../ui/Modal";

export function EmailCapture({
  open,
  tool,
  summary,
  onClose,
  onSubmit,
}: {
  open: boolean;
  tool: string;
  summary: string;
  onClose: () => void;
  onSubmit: (email: string, name?: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await onSubmit(email.trim(), name.trim() || undefined);
    setBusy(false);
    setDone(true);
  }

  function close() {
    setDone(false);
    onClose();
  }

  return (
    <Modal open={open} onClose={close} title={done ? "You’re on the list" : "Email me my results"}>
      {done ? (
        <div>
          <p className="text-sm text-muted">
            We’ll send a summary of your {tool} plan to {email}. No spam — unsubscribe anytime.
          </p>
          <p className="mt-3 rounded-xl bg-page p-3 text-sm text-ink">{summary}</p>
          <Button className="mt-5 w-full" onClick={close}>
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <p className="text-sm text-muted">
            Optional — you can keep using the calculator without this. We’ll email a snapshot. Calculations stay in
            your browser.
          </p>
          {summary ? <p className="rounded-xl bg-page p-3 text-sm text-ink">{summary}</p> : null}
          <Field label="First name (optional)">
            <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" />
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
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Saving…" : "Email my results"}
          </Button>
          <p className="text-xs text-muted">We’ll send a summary of this plan. No spam, unsubscribe anytime.</p>
        </form>
      )}
    </Modal>
  );
}
