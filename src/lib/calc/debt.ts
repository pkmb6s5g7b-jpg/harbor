import { addMonths, round2 } from "../money";

export type DebtMethod = "snowball" | "avalanche";

export type Debt = {
  id: string;
  name: string;
  balance: number;
  original: number;
  apr: number;
  minPayment: number;
};

export type DebtInputs = {
  method: DebtMethod;
  extra: number;
  start: Date;
  debts: Debt[];
};

export type DebtMonthRow = {
  month: number;
  date: Date;
  interest: number;
  paid: number;
  extraApplied: number;
  remaining: number;
  targetName: string | null;
};

export type DebtResult = {
  months: number;
  cleared: boolean;
  debtFreeDate: Date | null;
  totalInterest: number;
  totalPaid: number;
  interestSaved: number | null;
  minsOnlyInterest: number | null;
  firstGone: number | null;
  monthlyOutlay: number;
  remainingStart: number;
  originalTotal: number;
  schedule: DebtMonthRow[];
  orderNames: string[];
};

const MAX_MONTHS = 120;
const ALIVE = 0.005;

function orderIndices(debts: Debt[], method: DebtMethod): number[] {
  const idxs = debts.map((_, i) => i);
  if (method === "snowball") {
    idxs.sort((a, b) => debts[a].balance - debts[b].balance || a - b);
  } else {
    idxs.sort((a, b) => debts[b].apr - debts[a].apr || a - b);
  }
  return idxs;
}

export function nperInterest(bal: number, apr: number, min: number): number | null {
  if (bal <= 0 || min <= 0) return 0;
  const r = apr / 12;
  if (min <= bal * r + 1e-9) return null;
  const n = -Math.log(1 - (r * bal) / min) / Math.log(1 + r);
  return min * n - bal;
}

export function simulateDebt(inputs: DebtInputs): DebtResult {
  const debts = inputs.debts
    .filter((d) => d.name.trim() || d.balance > 0)
    .map((d) => ({ ...d }));

  const remainingStart = round2(debts.reduce((s, d) => s + Math.max(d.balance, 0), 0));
  const originalTotal = round2(
    debts.reduce((s, d) => s + Math.max(d.original || d.balance, 0), 0),
  );
  const monthlyMins = round2(debts.reduce((s, d) => s + (d.balance > ALIVE ? d.minPayment : 0), 0));
  const extra = Math.max(0, inputs.extra);
  const order = orderIndices(debts, inputs.method);
  const orderNames = order
    .filter((i) => debts[i].balance > ALIVE)
    .map((i) => debts[i].name || `Debt ${i + 1}`);

  const bals = debts.map((d) => d.balance);
  const schedule: DebtMonthRow[] = [];
  let months = 0;
  let totInt = 0;
  let totPay = 0;
  let firstGone: number | null = null;

  while (bals.some((b) => b > ALIVE) && months < MAX_MONTHS) {
    months += 1;
    const ints = bals.map((b, i) =>
      b > ALIVE ? round2(Math.max(b, 0) * debts[i].apr / 12) : 0,
    );
    const mins = bals.map((b, i) =>
      b <= ALIVE ? 0 : Math.min(debts[i].minPayment, round2(b + ints[i])),
    );
    const needs = bals.map((b, i) => Math.max(0, round2(b + ints[i] - mins[i])));
    let leftover = extra;
    const extras = bals.map(() => 0);
    for (const i of order) {
      if (bals[i] <= ALIVE) continue;
      extras[i] = Math.min(needs[i], leftover);
      leftover = round2(leftover - extras[i]);
    }

    const aliveBefore = bals.filter((b) => b > ALIVE).length;
    let monthInt = 0;
    let monthPay = 0;
    let monthExtra = 0;
    let targetName: string | null = null;
    for (const i of order) {
      if (bals[i] > ALIVE) {
        targetName = debts[i].name || `Debt ${i + 1}`;
        break;
      }
    }

    for (let i = 0; i < bals.length; i++) {
      const pay = round2(mins[i] + extras[i]);
      bals[i] = Math.max(0, round2(bals[i] + ints[i] - pay));
      monthInt += ints[i];
      monthPay += pay;
      monthExtra += extras[i];
    }
    totInt += monthInt;
    totPay += monthPay;
    const aliveAfter = bals.filter((b) => b > ALIVE).length;
    if (firstGone === null && aliveAfter < aliveBefore) firstGone = months;

    schedule.push({
      month: months,
      date: addMonths(inputs.start, months - 1),
      interest: round2(monthInt),
      paid: round2(monthPay),
      extraApplied: round2(monthExtra),
      remaining: round2(bals.reduce((s, b) => s + b, 0)),
      targetName,
    });
  }

  const cleared = !bals.some((b) => b > ALIVE);
  let minsOnly = 0;
  let never = false;
  for (const d of debts) {
    const v = nperInterest(d.balance, d.apr, d.minPayment);
    if (v === null) {
      never = true;
      break;
    }
    minsOnly += v;
  }

  const totalInterest = round2(totInt);
  const minsOnlyInterest = never ? null : round2(minsOnly);
  const interestSaved =
    minsOnlyInterest === null ? null : round2(Math.max(0, minsOnlyInterest - totalInterest));

  return {
    months,
    cleared,
    debtFreeDate: cleared && months > 0 ? addMonths(inputs.start, months - 1) : null,
    totalInterest,
    totalPaid: round2(totPay),
    interestSaved,
    minsOnlyInterest,
    firstGone,
    monthlyOutlay: round2(monthlyMins + extra),
    remainingStart,
    originalTotal,
    schedule,
    orderNames,
  };
}

export function compareMethods(inputs: DebtInputs): {
  snowball: DebtResult;
  avalanche: DebtResult;
} {
  return {
    snowball: simulateDebt({ ...inputs, method: "snowball" }),
    avalanche: simulateDebt({ ...inputs, method: "avalanche" }),
  };
}
