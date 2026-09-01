import type { ReactNode } from "react";

export function Badge({
  children,
  tone = "navy",
}: {
  children: ReactNode;
  tone?: "navy" | "teal" | "good" | "warn" | "bad";
}) {
  const tones = {
    navy: "bg-navy/10 text-navy",
    teal: "bg-card-teal text-teal-dark",
    good: "bg-green-bg text-green-fg",
    warn: "bg-amber-bg text-amber-fg",
    bad: "bg-red-bg text-red-fg",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
