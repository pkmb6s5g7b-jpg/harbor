"use client";

import Link from "next/link";
import type { Plan } from "../../lib/storage/types";
import { useHarbor } from "../providers/HarborProvider";

export function SavedPlansPanel({
  plans,
  onLoad,
  onDelete,
}: {
  plans: Plan[];
  onLoad: (plan: Plan) => void;
  onDelete: (id: string) => void;
}) {
  const { isPro } = useHarbor();
  if (!isPro) return null;

  return (
    <div className="rounded-xl border border-line-soft bg-page p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Saved plans</p>
        <Link href="/plans" className="text-xs font-medium text-navy hover:underline">
          All plans
        </Link>
      </div>
      {plans.length === 0 ? (
        <p className="text-xs text-muted">None yet. Use Save plan on the results, then they’ll show up here.</p>
      ) : (
        <ul className="space-y-1">
          {plans.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
              <button type="button" className="truncate text-left font-medium text-navy hover:underline" onClick={() => onLoad(p)}>
                {p.name}
              </button>
              <button type="button" className="shrink-0 text-xs text-muted hover:text-red-fg" onClick={() => onDelete(p.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
