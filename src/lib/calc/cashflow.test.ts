import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sampleCashFlowInputs } from "../../data/samples/cashflow";
import { simulateCashFlow } from "./cashflow";

describe("cash flow engine", () => {
  it("flags the car-repair month as negative and later recovers", () => {
    const result = simulateCashFlow(sampleCashFlowInputs);
    assert.equal(result.months.length, 6);
    assert.equal(result.months[1].negative, true);
    assert.ok(result.negativeCount >= 1);
    assert.ok(result.months[result.months.length - 1].end > 0);
    assert.ok(result.lowestBalance < 0);
  });

  it("applies one-time income in the chosen month", () => {
    const result = simulateCashFlow({
      startingBalance: 100,
      horizon: 3,
      start: new Date(2026, 0, 1),
      income: [{ id: "i", name: "Pay", amount: 100 }],
      expenses: [{ id: "e", name: "Bills", amount: 80 }],
      oneTime: [{ id: "o", name: "Bonus", amount: 50, monthIndex: 2, kind: "income" }],
    });
    assert.equal(result.months[0].end, 120);
    assert.equal(result.months[1].end, 190);
    assert.equal(result.months[2].end, 210);
  });
});
