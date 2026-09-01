import type { Debt, DebtInputs } from "../../lib/calc/debt";

export const SAMPLE_DEBT_START = new Date(2026, 8, 1); // Sep 2026

export const SAMPLE_DEBTS: Debt[] = [
  { id: "d1", name: "Store card", balance: 820, original: 850, apr: 0.2499, minPayment: 35 },
  { id: "d2", name: "Visa", balance: 3050, original: 3200, apr: 0.2199, minPayment: 80 },
  { id: "d3", name: "Mastercard", balance: 1380, original: 1450, apr: 0.1999, minPayment: 40 },
  { id: "d4", name: "Car loan", balance: 8400, original: 12400, apr: 0.065, minPayment: 265 },
  { id: "d5", name: "Student loan", balance: 12600, original: 15800, apr: 0.055, minPayment: 145 },
  { id: "d6", name: "Personal loan", balance: 2100, original: 2500, apr: 0.119, minPayment: 75 },
];

export const sampleDebtInputs: DebtInputs = {
  method: "snowball",
  extra: 200,
  start: SAMPLE_DEBT_START,
  debts: SAMPLE_DEBTS,
};

export const SAMPLE_DEBT_EXPECTED = {
  remaining: 28350,
  original: 36200,
  snowballMonths: 61,
  snowballInterest: 4590.63,
  avalancheMonths: 61,
  avalancheInterest: 4352.88,
  minsOnlyInterest: 7960.5,
} as const;
