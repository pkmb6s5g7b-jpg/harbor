import { addMonths, round2 } from "../money";

export type CashLine = {
  id: string;
  name: string;
  amount: number;
};

export type OneTimeItem = {
  id: string;
  name: string;
  amount: number;
  monthIndex: number;
  kind: "income" | "expense";
};

export type CashFlowInputs = {
  startingBalance: number;
  horizon: number;
  start: Date;
  income: CashLine[];
  expenses: CashLine[];
  oneTime: OneTimeItem[];
};

export type CashFlowMonth = {
  month: number;
  date: Date;
  income: number;
  expenses: number;
  oneTime: number;
  net: number;
  end: number;
  negative: boolean;
};

export type CashFlowResult = {
  months: CashFlowMonth[];
  endingBalance: number;
  lowestBalance: number;
  lowestMonth: Date | null;
  negativeCount: number;
  netOverHorizon: number;
};

export function simulateCashFlow(inputs: CashFlowInputs): CashFlowResult {
  const monthlyIncome = round2(
    inputs.income.reduce((s, l) => s + Math.max(0, l.amount || 0), 0),
  );
  const monthlyExpenses = round2(
    inputs.expenses.reduce((s, l) => s + Math.max(0, l.amount || 0), 0),
  );

  const months: CashFlowMonth[] = [];
  let bal = round2(inputs.startingBalance);
  let lowest = bal;
  let lowestMonth: Date | null = null;
  let negativeCount = 0;

  for (let i = 1; i <= inputs.horizon; i++) {
    const date = addMonths(inputs.start, i - 1);
    let oneTime = 0;
    for (const item of inputs.oneTime) {
      if (item.monthIndex === i) {
        oneTime += item.kind === "income" ? Math.max(0, item.amount) : -Math.max(0, item.amount);
      }
    }
    oneTime = round2(oneTime);
    const income = monthlyIncome + (oneTime > 0 ? oneTime : 0);
    const expenses = monthlyExpenses + (oneTime < 0 ? -oneTime : 0);
    const net = round2(monthlyIncome - monthlyExpenses + oneTime);
    bal = round2(bal + net);
    const negative = bal < 0;
    if (negative) negativeCount += 1;
    if (lowestMonth === null || bal < lowest) {
      lowest = bal;
      lowestMonth = date;
    }
    months.push({
      month: i,
      date,
      income: round2(income),
      expenses: round2(expenses),
      oneTime,
      net,
      end: bal,
      negative,
    });
  }

  const ending = months.length ? months[months.length - 1].end : round2(inputs.startingBalance);
  return {
    months,
    endingBalance: ending,
    lowestBalance: round2(lowest),
    lowestMonth,
    negativeCount,
    netOverHorizon: round2(ending - inputs.startingBalance),
  };
}
