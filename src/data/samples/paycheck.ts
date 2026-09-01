import type { PaycheckInputs } from "../../lib/calc/paycheck";

export const samplePaycheckInputs: PaycheckInputs = {
  frequency: "bi-weekly",
  paycheck: 1850,
  extraIncome: 120,
  lastPayday: "2026-08-07",
  bills: [
    { id: "b1", name: "Rent (this paycheck)", amount: 600 },
    { id: "b2", name: "Electric", amount: 95 },
    { id: "b3", name: "Phone", amount: 75 },
    { id: "b4", name: "Internet", amount: 65 },
    { id: "b5", name: "Car insurance", amount: 142 },
    { id: "b6", name: "Credit card min.", amount: 85 },
    { id: "b7", name: "Gym (2 weeks)", amount: 24 },
    { id: "b8", name: "Vet visit", amount: 80 },
  ],
  categories: [
    { id: "c1", name: "Groceries", amount: 180 },
    { id: "c2", name: "Gas / Transit", amount: 70 },
    { id: "c3", name: "Dining out", amount: 60 },
    { id: "c4", name: "Personal care", amount: 30 },
    { id: "c5", name: "Fun / Entertainment", amount: 40 },
    { id: "c6", name: "Household / Misc", amount: 35 },
    { id: "c7", name: "Savings transfer", amount: 150 },
    { id: "c8", name: "Buffer", amount: 40 },
  ],
};

export const SAMPLE_PAYCHECK_EXPECTED = {
  takeHome: 1970,
  billsTotal: 1166,
  afterBills: 804,
  planTotal: 605,
  afterPlan: 199,
} as const;
