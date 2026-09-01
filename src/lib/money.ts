/** Banker's-adjacent money rounding that matches the spreadsheet engines. */
export function round2(n: number): number {
  return Math.round((n + 1e-12) * 100) / 100;
}

export function formatMoney(n: number, options?: { sign?: boolean }): string {
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  if (options?.sign) {
    if (n < 0) return `−${formatted}`;
    if (n > 0) return `+${formatted}`;
  }
  if (n < 0) return `−${formatted}`;
  return formatted;
}

export function formatCompactMoney(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    return `${n < 0 ? "−" : ""}$${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 10_000) {
    return `${n < 0 ? "−" : ""}$${Math.round(abs / 1000)}k`;
  }
  return formatMoney(n);
}

export function parseMoney(raw: string): number {
  const cleaned = raw.replace(/[^0-9.\-]/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return 0;
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function formatMonthYear(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function formatMonthYearLong(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function addMonths(start: Date, months: number): Date {
  return new Date(start.getFullYear(), start.getMonth() + months, 1);
}

export function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2, 10)}`;
}
