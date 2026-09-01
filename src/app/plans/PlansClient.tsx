"use client";

import { tools } from "../../data/tools";
import { Container } from "../../components/layout/Container";
import { UnlockProButton } from "../../components/monetization/UnlockProButton";
import { useHarbor } from "../../components/providers/HarborProvider";
import { ButtonLink } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

function toolLabel(slug: string) {
  return tools.find((t) => t.slug === slug)?.shortName ?? slug;
}

function toolHref(slug: string, planId: string) {
  const href = tools.find((t) => t.slug === slug)?.href ?? "/tools";
  return `${href}?plan=${planId}`;
}

export function PlansClient() {
  const { isPro, listPlans, deletePlan } = useHarbor();
  const plans = listPlans();

  return (
    <Container className="py-14">
      <p className="text-sm font-medium uppercase tracking-wide text-teal">Pro</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">Saved plans</h1>
      <p className="mt-3 max-w-xl text-muted">
        Named snapshots of a calculator, stored in this browser. Open one to load it back into the tool.
      </p>

      {!isPro ? (
        <Card className="mt-8 p-6">
          <p className="font-medium text-ink">Saving plans is a Pro feature.</p>
          <p className="mt-1 text-sm text-muted">Unlock once, then Save plan on any calculator results.</p>
          <div className="mt-4">
            <UnlockProButton />
          </div>
        </Card>
      ) : plans.length === 0 ? (
        <Card className="mt-8 p-6">
          <p className="font-medium text-ink">No saved plans yet.</p>
          <p className="mt-1 text-sm text-muted">
            Open a calculator, then click <span className="font-medium">Save plan</span> next to Email me my results.
          </p>
          <ButtonLink href="/tools" className="mt-4">
            Open tools
          </ButtonLink>
        </Card>
      ) : (
        <div className="mt-8 space-y-3">
          {plans.map((p) => (
            <Card key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div className="min-w-0">
                <p className="font-medium text-ink">{p.name}</p>
                <p className="text-sm text-muted">
                  {toolLabel(p.tool)}
                  {p.updatedAt
                    ? ` · ${new Date(p.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                    : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <ButtonLink href={toolHref(p.tool, p.id)} size="sm">
                  Open
                </ButtonLink>
                <button
                  type="button"
                  className="h-9 rounded-xl px-3 text-sm text-muted hover:bg-red-bg hover:text-red-fg"
                  onClick={() => deletePlan(p.id)}
                >
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
