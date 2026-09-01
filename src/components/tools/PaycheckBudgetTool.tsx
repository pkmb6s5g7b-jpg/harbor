"use client";

import { useMemo, useState } from "react";
import { samplePaycheckInputs } from "../../data/samples/paycheck";
import { getTool } from "../../data/tools";
import {
  FREQUENCY_LABELS,
  simulatePaycheck,
  type NamedAmount,
  type PaycheckInputs,
  type PayFrequency,
} from "../../lib/calc/paycheck";
import { downloadCsv, toCsv } from "../../lib/csv";
import { formatMoney } from "../../lib/money";
import { LineEditor } from "../calc/LineEditor";
import { SavedPlansPanel } from "../calc/SavedPlansPanel";
import { useLoadPlanQuery } from "../calc/useLoadPlanQuery";
import { StackedBar } from "../calc/ProgressBar";
import { ToolShell } from "../calc/ToolShell";
import { ResultsActions } from "../monetization/ResultsActions";
import { SavePlanModal } from "../monetization/SavePlanModal";
import { SpreadsheetCard } from "../monetization/SpreadsheetCard";
import { useHarbor } from "../providers/HarborProvider";
import { Button } from "../ui/Button";
import { Card, StatCard } from "../ui/Card";
import { Field, Select } from "../ui/Input";
import { MoneyInput } from "../ui/MoneyInput";

const tool = getTool("paycheck-budget");

export function PaycheckBudgetTool() {
  const { isPro, listPlans, deletePlan } = useHarbor();
  const [frequency, setFrequency] = useState<PayFrequency>(samplePaycheckInputs.frequency);
  const [paycheck, setPaycheck] = useState(samplePaycheckInputs.paycheck);
  const [extraIncome, setExtraIncome] = useState(samplePaycheckInputs.extraIncome);
  const [bills, setBills] = useState<NamedAmount[]>(samplePaycheckInputs.bills.map((b) => ({ ...b })));
  const [categories, setCategories] = useState<NamedAmount[]>(
    samplePaycheckInputs.categories.map((c) => ({ ...c })),
  );
  const [isSample, setIsSample] = useState(true);
  const [saveOpen, setSaveOpen] = useState(false);

  const inputs: PaycheckInputs = {
    frequency,
    paycheck,
    extraIncome,
    lastPayday: samplePaycheckInputs.lastPayday,
    bills,
    categories,
  };
  const result = useMemo(
    () => simulatePaycheck(inputs),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [frequency, paycheck, extraIncome, bills, categories],
  );
  const plans = listPlans("paycheck-budget");

  function loadPlan(plan: { payload: unknown }) {
    const payload = plan.payload as PaycheckInputs;
    setFrequency(payload.frequency);
    setPaycheck(payload.paycheck);
    setExtraIncome(payload.extraIncome);
    setBills(payload.bills);
    setCategories(payload.categories);
    setIsSample(false);
  }

  useLoadPlanQuery("paycheck-budget", loadPlan);

  function loadSample() {
    setFrequency(samplePaycheckInputs.frequency);
    setPaycheck(samplePaycheckInputs.paycheck);
    setExtraIncome(samplePaycheckInputs.extraIncome);
    setBills(samplePaycheckInputs.bills.map((b) => ({ ...b })));
    setCategories(samplePaycheckInputs.categories.map((c) => ({ ...c })));
    setIsSample(true);
  }

  function reset() {
    setFrequency("bi-weekly");
    setPaycheck(0);
    setExtraIncome(0);
    setBills([]);
    setCategories([]);
    setIsSample(false);
  }

  const leftoverTone = result.afterPlan >= 0 ? "good" : "bad";
  const billsTone = result.afterBills >= 0 ? "teal" : "bad";
  const summary = `${result.frequencyLabel} take-home ${formatMoney(result.takeHome)} · after bills ${formatMoney(result.afterBills)} · after plan ${formatMoney(result.afterPlan)}`;

  function exportCsv() {
    const rows: (string | number)[][] = [
      ["Type", "Name", "Amount"],
      ...bills.map((b) => ["Bill", b.name, b.amount]),
      ...categories.map((c) => ["Category", c.name, c.amount]),
      ["Total", "Take-home", result.takeHome],
      ["Total", "Bills", result.billsTotal],
      ["Total", "After bills", result.afterBills],
      ["Total", "Plan", result.planTotal],
      ["Total", "After plan", result.afterPlan],
    ];
    downloadCsv("harbor-paycheck-budget.csv", toCsv(rows));
  }

  return (
    <>
      <ToolShell
        title={tool.name}
        description="Enter this paycheck, the bills that hit it, and what you plan to spend. Leftover is the number that matters."
        isSample={isSample}
        onLoadSample={loadSample}
        onReset={reset}
        inputs={
          <Card className="p-5">
            <div className="space-y-5">
              <SavedPlansPanel plans={plans} onLoad={loadPlan} onDelete={deletePlan} />
              <Field label="Pay frequency">
                <Select
                  value={frequency}
                  onChange={(e) => {
                    setFrequency(e.target.value as PayFrequency);
                    setIsSample(false);
                  }}
                >
                  {(Object.keys(FREQUENCY_LABELS) as PayFrequency[]).map((k) => (
                    <option key={k} value={k}>
                      {FREQUENCY_LABELS[k]}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Take-home paycheck">
                  <MoneyInput
                    value={paycheck}
                    onChange={(n) => {
                      setPaycheck(n);
                      setIsSample(false);
                    }}
                  />
                </Field>
                <Field label="Extra income" hint="Side gig, reimbursement">
                  <MoneyInput
                    value={extraIncome}
                    onChange={(n) => {
                      setExtraIncome(n);
                      setIsSample(false);
                    }}
                  />
                </Field>
              </div>
              <LineEditor
                title="Bills this paycheck"
                addLabel="+ Add bill"
                namePlaceholder="Rent, phone…"
                lines={bills}
                onChange={(next) => {
                  setBills(next);
                  setIsSample(false);
                }}
              />
              <LineEditor
                title="Budget categories"
                addLabel="+ Add category"
                namePlaceholder="Groceries, gas…"
                lines={categories}
                onChange={(next) => {
                  setCategories(next);
                  setIsSample(false);
                }}
              />
              <Button
                className="w-full lg:hidden"
                onClick={() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" })}
              >
                See results
              </Button>
            </div>
          </Card>
        }
        results={
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <StatCard label="This paycheck" value={formatMoney(result.takeHome)} hint={`${result.frequencyLabel} take-home + extra`} />
              <StatCard label="Bills" value={formatMoney(result.billsTotal)} />
              <StatCard
                label="Left after bills"
                value={formatMoney(result.afterBills)}
                tone={billsTone}
              />
              <StatCard
                label="Left after bills + plan"
                value={formatMoney(result.afterPlan)}
                tone={leftoverTone}
                hint={result.afterPlan < 0 ? "The plan is bigger than this paycheck." : "This is what you can actually spend freely."}
              />
            </div>
            <Card className="p-5">
              <h2 className="font-serif text-lg text-ink">Breakdown</h2>
              <div className="mt-3">
                <StackedBar
                  segments={[
                    { label: "Bills", value: result.billsTotal, color: "#1B4F72" },
                    { label: "Planned spending", value: result.planTotal, color: "#1F7A6B" },
                    {
                      label: result.afterPlan >= 0 ? "Leftover" : "Short",
                      value: Math.abs(result.afterPlan),
                      color: result.afterPlan >= 0 ? "#C9A227" : "#C0392B",
                    },
                  ]}
                />
              </div>
              <div className="mt-4 no-print">
                <ResultsActions
                  tool={tool.shortName}
                  summary={summary}
                  onSave={() => setSaveOpen(true)}
                  onExport={exportCsv}
                  onPrint={() => window.print()}
                />
              </div>
            </Card>
            <Card className="p-5">
              <h2 className="font-serif text-lg text-ink">Bills</h2>
              <ul className="mt-2 divide-y divide-line-soft">
                {bills.filter((b) => b.name || b.amount).map((b) => (
                  <li key={b.id} className="flex justify-between py-2 text-sm">
                    <span>{b.name || "Untitled"}</span>
                    <span className="tabular">{formatMoney(b.amount)}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-5">
              <h2 className="font-serif text-lg text-ink">Categories</h2>
              <ul className="mt-2 divide-y divide-line-soft">
                {categories.filter((c) => c.name || c.amount).map((c) => (
                  <li key={c.id} className="flex justify-between py-2 text-sm">
                    <span>{c.name || "Untitled"}</span>
                    <span className="tabular">{formatMoney(c.amount)}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <SpreadsheetCard productId={tool.spreadsheetProductId} light={isPro} />
          </div>
        }
      />
      <SavePlanModal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        tool="paycheck-budget"
        payload={inputs}
      />
    </>
  );
}
