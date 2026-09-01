"use client";

import { newId } from "../../lib/money";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { MoneyInput } from "../ui/MoneyInput";

export type Line = { id: string; name: string; amount: number };

export function LineEditor({
  title,
  addLabel,
  lines,
  onChange,
  namePlaceholder,
}: {
  title: string;
  addLabel: string;
  lines: Line[];
  onChange: (lines: Line[]) => void;
  namePlaceholder?: string;
}) {
  function update(id: string, patch: Partial<Line>) {
    onChange(lines.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-ink">{title}</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange([...lines, { id: newId(), name: "", amount: 0 }])}
        >
          {addLabel}
        </Button>
      </div>
      <div className="space-y-2">
        {lines.map((line) => (
          <div key={line.id} className="grid min-w-0 grid-cols-[minmax(0,1fr)_6.5rem_auto] items-center gap-2">
            <Input
              placeholder={namePlaceholder ?? "Name"}
              value={line.name}
              onChange={(e) => update(line.id, { name: e.target.value })}
            />
            <MoneyInput value={line.amount} onChange={(amount) => update(line.id, { amount })} />
            <button
              type="button"
              className="rounded-lg p-2 text-muted hover:bg-red-bg hover:text-red-fg"
              aria-label={`Remove ${line.name || "row"}`}
              onClick={() => onChange(lines.filter((l) => l.id !== line.id))}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
