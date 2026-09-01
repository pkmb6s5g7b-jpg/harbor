"use client";

import { useMemo, useState } from "react";
import { sampleCashFlowInputs } from "../../data/samples/cashflow";
import { getTool } from "../../data/tools";
import {
  simulateCashFlow,
  type CashFlowInputs,
  type CashLine,
  type OneTimeItem,
} from "../../lib/calc/cashflow";
import { downloadCsv, toCsv } from "../../lib/csv";
import { formatMoney, formatMonthYear, formatMonthYearLong, newId } from "../../lib/money";
import { BalanceChart } from "../calc/BalanceChart";
import { LineEditor } from "../calc/LineEditor";
import { SavedPlansPanel } from "../calc/SavedPlansPanel";
import { useLoadPlanQuery } from "../calc/useLoadPlanQuery";
import { MonthTable } from "../calc/MonthTable";
import { ToolShell } from "../calc/ToolShell";
import { ResultsActions } from "../monetization/ResultsActions";
import { SavePlanModal } from "../monetization/SavePlanModal";
import { SpreadsheetCard } from "../monetization/SpreadsheetCard";
import { useHarbor } from "../providers/HarborProvider";
import { Button } from "../ui/Button";
import { Card, StatCard } from "../ui/Card";
import { Field, Input, Select } from "../ui/Input";
import { MoneyInput } from "../ui/MoneyInput";

const tool = getTool("cash-flow");

export function CashFlowTool() {
  const { isPro, listPlans, deletePlan } = useHarbor();
  const [startingBalance, setStartingBalance] = useState(sampleCashFlowInputs.startingBalance);
  const [horizon, setHorizon] = useState(sampleCashFlowInputs.horizon);
  const [start, setStart] = useState(sampleCashFlowInputs.start);
  const [income, setIncome] = useState<CashLine[]>(sampleCashFlowInputs.income.map((l) => ({ ...l })));
  const [expenses, setExpenses] = useState<CashLine[]>(sampleCashFlowInputs.expenses.map((l) => ({ ...l })));
  const [oneTime, setOneTime] = useState<OneTimeItem[]>(sampleCashFlowInputs.oneTime.map((o) => ({ ...o })));
  const [isSample, setIsSample] = useState(true);
  const [saveOpen, setSaveOpen] = useState(false);

  const freeHorizons = [3, 6, 12];
  const horizons = isPro ? [3, 6, 12, 24] : freeHorizons;

  const inputs: CashFlowInputs = {
    startingBalance,
    horizon,
    start,
    income,
    expenses,
    oneTime,
  };
  const result = useMemo(
    () => simulateCashFlow(inputs),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [startingBalance, horizon, start, income, expenses, oneTime],
  );
  const plans = listPlans("cash-flow");

  function loadPlan(plan: { payload: unknown }) {
    const payload = plan.payload as CashFlowInputs & { start: string };
    setStartingBalance(payload.startingBalance);
    setHorizon(payload.horizon);
    setStart(new Date(payload.start));
    setIncome(payload.income);
    setExpenses(payload.expenses);
    setOneTime(payload.oneTime);
    setIsSample(false);
  }

  useLoadPlanQuery("cash-flow", loadPlan);

  function loadSample() {
    setStartingBalance(sampleCashFlowInputs.startingBalance);
    setHorizon(sampleCashFlowInputs.horizon);
    setStart(sampleCashFlowInputs.start);
    setIncome(sampleCashFlowInputs.income.map((l) => ({ ...l })));
    setExpenses(sampleCashFlowInputs.expenses.map((l) => ({ ...l })));
    setOneTime(sampleCashFlowInputs.oneTime.map((o) => ({ ...o })));
    setIsSample(true);
  }

  function reset() {
    setStartingBalance(0);
    setHorizon(6);
    setStart(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    setIncome([{ id: newId(), name: "", amount: 0 }]);
    setExpenses([{ id: newId(), name: "", amount: 0 }]);
    setOneTime([]);
    setIsSample(false);
  }

  const summary = `Ending ${formatMoney(result.endingBalance)} over ${horizon} months · ${result.negativeCount} negative month${result.negativeCount === 1 ? "" : "s"}`;

  function exportCsv() {
    const rows: (string | number)[][] = [
      ["Month", "Income", "Expenses", "One-time", "Net", "Ending balance", "Negative"],
      ...result.months.map((m) => [
        formatMonthYearLong(m.date),
        m.income,
        m.expenses,
        m.oneTime,
        m.net,
        m.end,
        m.negative ? "yes" : "no",
      ]),
    ];
    downloadCsv("harbor-cash-flow.csv", toCsv(rows));
  }

  function toMonthValue(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  return (
    <>
      <ToolShell
        title={tool.name}
        description="Start with today’s balance. Add monthly income and expenses. We’ll flag any month that would go negative."
        isSample={isSample}
        onLoadSample={loadSample}
        onReset={reset}
        inputs={
          <Card className="p-5">
            <div className="space-y-5">
              <SavedPlansPanel plans={plans} onLoad={loadPlan} onDelete={deletePlan} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Starting balance">
                  <MoneyInput
                    value={startingBalance}
                    onChange={(n) => {
                      setStartingBalance(n);
                      setIsSample(false);
                    }}
                  />
                </Field>
                <Field label="Start month">
                  <Input
                    type="month"
                    value={toMonthValue(start)}
                    onChange={(e) => {
                      const [y, m] = e.target.value.split("-").map(Number);
                      setStart(new Date(y, (m || 1) - 1, 1));
                      setIsSample(false);
                    }}
                  />
                </Field>
              </div>
              <Field label="Horizon">
                <Select
                  value={horizon}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    setHorizon(n);
                    setIsSample(false);
                  }}
                >
                  {horizons.map((h) => (
                    <option key={h} value={h}>
                      {h} months
                    </option>
                  ))}
                </Select>
                {!isPro ? (
                  <p className="mt-1 text-xs text-muted">Pro unlocks a 24-month forecast.</p>
                ) : null}
              </Field>
              <LineEditor
                title="Monthly income"
                addLabel="+ Add income"
                namePlaceholder="Paycheck, side gig…"
                lines={income}
                onChange={(next) => {
                  setIncome(next);
                  setIsSample(false);
                }}
              />
              <LineEditor
                title="Monthly expenses"
                addLabel="+ Add expense"
                namePlaceholder="Rent, groceries…"
                lines={expenses}
                onChange={(next) => {
                  setExpenses(next);
                  setIsSample(false);
                }}
              />
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-ink">One-time items</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setOneTime((os) => [
                        ...os,
                        { id: newId(), name: "", amount: 0, monthIndex: 1, kind: "expense" },
                      ])
                    }
                  >
                    + Add one-time
                  </Button>
                </div>
                <div className="space-y-2">
                  {oneTime.map((item) => (
                    <div key={item.id} className="rounded-xl border border-line-soft p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <Input
                          placeholder="Car repair, bonus…"
                          value={item.name}
                          onChange={(e) =>
                            setOneTime((os) => os.map((o) => (o.id === item.id ? { ...o, name: e.target.value } : o)))
                          }
                        />
                        <button
                          type="button"
                          className="rounded-lg p-2 text-muted hover:bg-red-bg hover:text-red-fg"
                          aria-label="Remove one-time item"
                          onClick={() => setOneTime((os) => os.filter((o) => o.id !== item.id))}
                        >
                          ✕
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <MoneyInput
                          value={item.amount}
                          onChange={(amount) =>
                            setOneTime((os) => os.map((o) => (o.id === item.id ? { ...o, amount } : o)))
                          }
                        />
                        <Select
                          value={item.kind}
                          onChange={(e) =>
                            setOneTime((os) =>
                              os.map((o) =>
                                o.id === item.id ? { ...o, kind: e.target.value as OneTimeItem["kind"] } : o,
                              ),
                            )
                          }
                        >
                          <option value="expense">Out</option>
                          <option value="income">In</option>
                        </Select>
                        <Select
                          value={item.monthIndex}
                          onChange={(e) =>
                            setOneTime((os) =>
                              os.map((o) => (o.id === item.id ? { ...o, monthIndex: Number(e.target.value) } : o)),
                            )
                          }
                        >
                          {Array.from({ length: horizon }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              Month {i + 1}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
              <StatCard
                label="Ending balance"
                value={formatMoney(result.endingBalance)}
                tone={result.endingBalance >= 0 ? "teal" : "bad"}
              />
              <StatCard
                label="Lowest month"
                value={formatMoney(result.lowestBalance)}
                hint={result.lowestMonth ? formatMonthYearLong(result.lowestMonth) : undefined}
                tone={result.lowestBalance < 0 ? "bad" : "default"}
              />
              <StatCard
                label="Negative months"
                value={String(result.negativeCount)}
                tone={result.negativeCount > 0 ? "warn" : "good"}
              />
              <StatCard
                label="Net over horizon"
                value={formatMoney(result.netOverHorizon)}
                tone={result.netOverHorizon >= 0 ? "good" : "bad"}
              />
            </div>
            <Card className="p-5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-serif text-lg text-ink">Projected balance</h2>
                <ResultsActions
                  tool={tool.shortName}
                  summary={summary}
                  onSave={() => setSaveOpen(true)}
                  onExport={exportCsv}
                  onPrint={() => window.print()}
                />
              </div>
              <BalanceChart points={result.months.map((m) => ({ date: m.date, value: m.end }))} />
            </Card>
            <Card className="p-5">
              <h2 className="font-serif text-lg text-ink">Month table</h2>
              <div className="mt-3">
                <MonthTable
                  headers={["Month", "In", "Out", "Ending", "Status"]}
                  rows={result.months.map((m) => [
                    formatMonthYear(m.date),
                    formatMoney(m.income),
                    formatMoney(m.expenses),
                    <span key={m.month} className={m.negative ? "font-medium text-red-fg" : ""}>
                      {formatMoney(m.end)}
                    </span>,
                    m.negative ? (
                      <span key={`s${m.month}`} className="text-red-fg">
                        Negative
                      </span>
                    ) : (
                      "OK"
                    ),
                  ])}
                />
              </div>
            </Card>
            <SpreadsheetCard productId={tool.spreadsheetProductId} light={isPro} />
          </div>
        }
      />
      <SavePlanModal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        tool="cash-flow"
        payload={{ ...inputs, start: start.toISOString() }}
      />
    </>
  );
}
