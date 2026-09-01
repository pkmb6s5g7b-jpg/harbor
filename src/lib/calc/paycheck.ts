import { round2 } from "../money";

export type PayFrequency = "weekly" | "bi-weekly" | "monthly";

export type NamedAmount = {
  id: string;
  name: string;
  amount: number;
};

export type PaycheckInputs = {
  frequency: PayFrequency;
  paycheck: number;
  extraIncome: number;
  lastPayday: string | null;
  bills: NamedAmount[];
  categories: NamedAmount[];
};

export type PaycheckResult = {
  takeHome: number;
  billsTotal: number;
  afterBills: number;
  planTotal: number;
  afterPlan: number;
  frequencyLabel: string;
  periodLabel: string | null;
};

export const FREQUENCY_LABELS: Record<PayFrequency, string> = {
  weekly: "Weekly",
  "bi-weekly": "Bi-weekly",
  monthly: "Monthly",
};

export function simulatePaycheck(inputs: PaycheckInputs): PaycheckResult {
  const takeHome = round2(Math.max(0, inputs.paycheck) + Math.max(0, inputs.extraIncome));
  const billsTotal = round2(
    inputs.bills.reduce((s, b) => s + Math.max(0, b.amount || 0), 0),
  );
  const planTotal = round2(
    inputs.categories.reduce((s, c) => s + Math.max(0, c.amount || 0), 0),
  );
  const afterBills = round2(takeHome - billsTotal);
  const afterPlan = round2(afterBills - planTotal);

  return {
    takeHome,
    billsTotal,
    afterBills,
    planTotal,
    afterPlan,
    frequencyLabel: FREQUENCY_LABELS[inputs.frequency],
    periodLabel: inputs.lastPayday || null,
  };
}
