import type { CashFlowInputs } from "../../lib/calc/cashflow";

export const sampleCashFlowInputs: CashFlowInputs = {
  startingBalance: 1100,
  horizon: 6,
  start: new Date(2026, 8, 1),
  income: [{ id: "i1", name: "Take-home pay", amount: 4010 }],
  expenses: [
    { id: "e1", name: "Housing", amount: 1200 },
    { id: "e2", name: "Utilities", amount: 235 },
    { id: "e3", name: "Food", amount: 450 },
    { id: "e4", name: "Transportation", amount: 280 },
    { id: "e5", name: "Debt payments", amount: 640 },
    { id: "e6", name: "Personal & fun", amount: 430 },
    { id: "e7", name: "Savings", amount: 400 },
  ],
  oneTime: [
    {
      id: "o1",
      name: "Car repair",
      amount: 2200,
      monthIndex: 2,
      kind: "expense",
    },
  ],
};
