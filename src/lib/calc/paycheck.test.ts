import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { samplePaycheckInputs, SAMPLE_PAYCHECK_EXPECTED } from "../../data/samples/paycheck";
import { simulatePaycheck } from "./paycheck";

describe("paycheck budget engine", () => {
  it("matches the spreadsheet sample cards", () => {
    const result = simulatePaycheck(samplePaycheckInputs);
    assert.equal(result.takeHome, SAMPLE_PAYCHECK_EXPECTED.takeHome);
    assert.equal(result.billsTotal, SAMPLE_PAYCHECK_EXPECTED.billsTotal);
    assert.equal(result.afterBills, SAMPLE_PAYCHECK_EXPECTED.afterBills);
    assert.equal(result.planTotal, SAMPLE_PAYCHECK_EXPECTED.planTotal);
    assert.equal(result.afterPlan, SAMPLE_PAYCHECK_EXPECTED.afterPlan);
  });

  it("treats leftover as able to go negative", () => {
    const result = simulatePaycheck({
      ...samplePaycheckInputs,
      paycheck: 500,
      extraIncome: 0,
    });
    assert.ok(result.afterBills < 0);
  });
});
