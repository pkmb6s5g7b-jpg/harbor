"use client";

import { useState } from "react";
import { newId } from "../../lib/money";
import type { ToolSlug } from "../../data/tools";
import type { Plan } from "../../lib/storage/types";
import { goToStripeCheckout, startStripeCheckout } from "../../lib/commerce/start-checkout";
import { useHarbor } from "../providers/HarborProvider";
import { Button } from "../ui/Button";
import { Field, Input } from "../ui/Input";
import { Modal } from "../ui/Modal";

export function SavePlanModal({
  open,
  onClose,
  tool,
  payload,
}: {
  open: boolean;
  onClose: () => void;
  tool: ToolSlug;
  payload: unknown;
}) {
  const { savePlan } = useHarbor();
  const [name, setName] = useState("My plan");
  const [status, setStatus] = useState<"idle" | "saved" | "need-pro">("idle");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const plan: Plan = {
      id: newId(),
      tool,
      name: name.trim() || "Untitled plan",
      payload,
      updatedAt: new Date().toISOString(),
    };
    const result = savePlan(plan);
    if (!result.ok) {
      setStatus("need-pro");
      return;
    }
    setStatus("saved");
  }

  function close() {
    setStatus("idle");
    onClose();
  }

  return (
    <Modal open={open} onClose={close} title="Save this plan">
      {status === "saved" ? (
        <div>
          <p className="text-sm text-muted">
            Saved as “{name}” in this browser. Find it at the top of this calculator, or under{" "}
            <a href="/plans" className="font-medium text-navy underline-offset-2 hover:underline">
              Plans
            </a>{" "}
            in the menu.
          </p>
          <Button className="mt-5 w-full" onClick={close}>
            Done
          </Button>
        </div>
      ) : status === "need-pro" ? (
        <div>
          <p className="text-sm text-muted">Named saved plans are a Pro feature. Unlock once to keep as many as you like.</p>
          <div className="mt-5 flex gap-2">
            <Button
              className="flex-1"
              onClick={async () => {
                close();
                const { url } = await startStripeCheckout("pro");
                if (url) goToStripeCheckout(url);
              }}
            >
              Unlock Pro
            </Button>
            <Button variant="secondary" className="flex-1" onClick={close}>
              Not now
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field label="Plan name">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Button type="submit" className="w-full">
            Save
          </Button>
        </form>
      )}
    </Modal>
  );
}
