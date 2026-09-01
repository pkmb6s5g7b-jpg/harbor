import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-w-0 max-w-full rounded-2xl border border-line-soft bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "good" | "warn" | "bad" | "teal";
}) {
  const tones = {
    default: "bg-white",
    good: "bg-green-bg",
    warn: "bg-amber-bg",
    bad: "bg-red-bg",
    teal: "bg-card-teal",
  };
  const valueColor = {
    default: "text-ink",
    good: "text-green-fg",
    warn: "text-amber-fg",
    bad: "text-red-fg",
    teal: "text-teal-dark",
  };
  return (
    <div className={`rounded-2xl border border-line-soft p-4 ${tones[tone]}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-1 break-words font-serif text-2xl tabular tracking-tight ${valueColor[tone]}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
