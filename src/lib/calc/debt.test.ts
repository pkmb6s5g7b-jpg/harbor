import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sampleDebtInputs, SAMPLE_DEBT_EXPECTED } from "../../data/samples/debt";
import { compareMethods, nperInterest, simulateDebt } from "./debt";

describe("debt payoff engine", () => {
  it("matches the spreadsheet Snowball sample", () => {
    const result = simulateDebt(sampleDebtInputs);
    assert.equal(result.remainingStart, SAMPLE_DEBT_EXPECTED.remaining);
    assert.equal(result.months, SAMPLE_DEBT_EXPECTED.snowballMonths);
    assert.equal(result.cleared, true);
    assert.equal(result.totalInterest, SAMPLE_DEBT_EXPECTED.snowballInterest);
    assert.equal(result.debtFreeDate?.getFullYear(), 2031);
    assert.equal(result.debtFreeDate?.getMonth(), 8);
  });

  it("matches the spreadsheet Avalanche sample", () => {
    const result = simulateDebt({ ...sampleDebtInputs, method: "avalanche" });
    assert.equal(result.months, SAMPLE_DEBT_EXPECTED.avalancheMonths);
    assert.equal(result.totalInterest, SAMPLE_DEBT_EXPECTED.avalancheInterest);
  });

  it("computes interest saved vs minimums-only", () => {
    const result = simulateDebt(sampleDebtInputs);
    assert.equal(result.minsOnlyInterest, SAMPLE_DEBT_EXPECTED.minsOnlyInterest);
    assert.equal(
      result.interestSaved,
      Math.round((SAMPLE_DEBT_EXPECTED.minsOnlyInterest - SAMPLE_DEBT_EXPECTED.snowballInterest) * 100) / 100,
    );
  });

  it("orders Snowball by lowest balance", () => {
    const result = simulateDebt(sampleDebtInputs);
    assert.equal(result.orderNames[0], "Store card");
  });

  it("orders Avalanche by highest APR", () => {
    const result = simulateDebt({ ...sampleDebtInputs, method: "avalanche" });
    assert.equal(result.orderNames[0], "Store card");
    assert.equal(result.orderNames[1], "Visa");
  });

  it("flags never-payoff when min does not cover interest", () => {
    assert.equal(nperInterest(10000, 0.3, 10), null);
  });

  it("returns both methods from compareMethods", () => {
    const { snowball, avalanche } = compareMethods(sampleDebtInputs);
    assert.equal(snowball.totalInterest, SAMPLE_DEBT_EXPECTED.snowballInterest);
    assert.equal(avalanche.totalInterest, SAMPLE_DEBT_EXPECTED.avalancheInterest);
    assert.ok(avalanche.totalInterest < snowball.totalInterest);
  });
});
