"use client";

import { useMemo, useState } from "react";
import { sampleDebtInputs } from "../../data/samples/debt";
import { getTool } from "../../data/tools";
import { compareMethods, simulateDebt, type Debt, type DebtInputs, type DebtMethod } from "../../lib/calc/debt";
import { downloadCsv, toCsv } from "../../lib/csv";
import { formatMoney, formatMonthYearLong, newId } from "../../lib/money";
import { MonthTable } from "../calc/MonthTable";
import { SavedPlansPanel } from "../calc/SavedPlansPanel";
import { useLoadPlanQuery } from "../calc/useLoadPlanQuery";
import { ProgressBar } from "../calc/ProgressBar";
import { ToolShell } from "../calc/ToolShell";
import { SpreadsheetCard } from "../monetization/SpreadsheetCard";
import { ResultsActions } from "../monetization/ResultsActions";
import { SavePlanModal } from "../monetization/SavePlanModal";
import { useHarbor } from "../providers/HarborProvider";
import { Card, StatCard } from "../ui/Card";
import { Field, Input, Select } from "../ui/Input";
import { MoneyInput, PercentInput } from "../ui/MoneyInput";
import { Button } from "../ui/Button";

const tool = getTool("debt-payoff");
const FREE_DEBT_CAP = 8;

function emptyDebt(): Debt {
  return { id: newId(), name: "", balance: 0, original: 0, apr: 0, minPayment: 0 };
}

function toMonthValue(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function fromMonthValue(v: string) {
  const [y, m] = v.split("-").map(Number);
  return new Date(y, (m || 1) - 1, 1);
}

export function DebtPayoffTool() {
  const { isPro, listPlans, deletePlan } = useHarbor();
  const [method, setMethod] = useState<DebtMethod>(sampleDebtInputs.method);
  const [extra, setExtra] = useState(sampleDebtInputs.extra);
  const [start, setStart] = useState(sampleDebtInputs.start);
  const [debts, setDebts] = useState<Debt[]>(sampleDebtInputs.debts.map((d) => ({ ...d })));
  const [isSample, setIsSample] = useState(true);
  const [saveOpen, setSaveOpen] = useState(false);

  const inputs: DebtInputs = useMemo(
    () => ({ method, extra, start, debts }),
    [method, extra, start, debts],
  );

  const result = useMemo(() => simulateDebt(inputs), [inputs]);
  const comparison = useMemo(() => compareMethods(inputs), [inputs]);
  const plans = listPlans("debt-payoff");

  function loadPlan(plan: { payload: unknown }) {
    const payload = plan.payload as DebtInputs & { start: string };
    setMethod(payload.method);
    setExtra(payload.extra);
    setStart(new Date(payload.start));
    setDebts(payload.debts);
    setIsSample(false);
  }

  useLoadPlanQuery("debt-payoff", loadPlan);

  function loadSample() {
    setMethod(sampleDebtInputs.method);
    setExtra(sampleDebtInputs.extra);
    setStart(sampleDebtInputs.start);
    setDebts(sampleDebtInputs.debts.map((d) => ({ ...d })));
    setIsSample(true);
  }

  function reset() {
    setMethod("snowball");
    setExtra(0);
    setStart(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    setDebts([emptyDebt()]);
    setIsSample(false);
  }

  function updateDebt(id: string, patch: Partial<Debt>) {
    setDebts((ds) => ds.map((d) => (d.id === id ? { ...d, ...patch } : d)));
    setIsSample(false);
  }

  const canAdd = isPro || debts.length < FREE_DEBT_CAP;
  const paidDown =
    result.originalTotal > 0
      ? Math.max(0, ((result.originalTotal - result.remainingStart) / result.originalTotal) * 100)
      : 0;

  const summary = result.cleared
    ? `Debt-free ${result.debtFreeDate ? formatMonthYearLong(result.debtFreeDate) : ""} · ${result.months} months · interest ${formatMoney(result.totalInterest)}`
    : `Still in debt after ${result.months} months · remaining ${formatMoney(result.schedule.at(-1)?.remaining ?? result.remainingStart)}`;

  function exportCsv() {
    const rows: (string | number)[][] = [
      ["Month", "Date", "Target", "Paid", "Interest", "Extra applied", "Remaining"],
      ...result.schedule.map((m) => [
        m.month,
        formatMonthYearLong(m.date),
        m.targetName ?? "",
        m.paid,
        m.interest,
        m.extraApplied,
        m.remaining,
      ]),
    ];
    downloadCsv("harbor-debt-payoff.csv", toCsv(rows));
  }

  return (
    <>
      <ToolShell
        title={tool.name}
        description={tool.blurb}
        isSample={isSample}
        onLoadSample={loadSample}
        onReset={reset}
        inputs={
          <Card className="p-5">
            <div className="min-w-0 space-y-4">
              <SavedPlansPanel
                plans={plans}
                onLoad={loadPlan}
                onDelete={deletePlan}
              />
              <Field label="Payoff method">
                <Select
                  value={method}
                  onChange={(e) => {
                    setMethod(e.target.value as DebtMethod);
                    setIsSample(false);
                  }}
                >
                  <option value="snowball">Snowball — smallest balance first</option>
                  <option value="avalanche">Avalanche — highest APR first</option>
                </Select>
              </Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Extra monthly payment" hint="On top of minimums">
                  <MoneyInput
                    value={extra}
                    onChange={(n) => {
                      setExtra(n);
                      setIsSample(false);
                    }}
                  />
                </Field>
                <Field label="Plan start">
                  <Input
                    type="month"
                    value={toMonthValue(start)}
                    onChange={(e) => {
                      setStart(fromMonthValue(e.target.value));
                      setIsSample(false);
                    }}
                  />
                </Field>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-ink">Debts</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={!canAdd}
                    onClick={() => {
                      setDebts((ds) => [...ds, emptyDebt()]);
                      setIsSample(false);
                    }}
                  >
                    + Add debt
                  </Button>
                </div>
                {!isPro && debts.length >= FREE_DEBT_CAP ? (
                  <p className="mb-2 text-xs text-muted">Free plans include up to 8 debts — same as the spreadsheet.</p>
                ) : null}
                <div className="space-y-3">
                  {debts.map((d) => (
                    <div key={d.id} className="rounded-xl border border-line-soft p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <Input
                          placeholder="Name"
                          value={d.name}
                          onChange={(e) => updateDebt(d.id, { name: e.target.value })}
                        />
                        <button
                          type="button"
                          className="rounded-lg p-2 text-muted hover:bg-red-bg hover:text-red-fg"
                          aria-label="Remove debt"
                          onClick={() => {
                            setDebts((ds) => ds.filter((x) => x.id !== d.id));
                            setIsSample(false);
                          }}
                        >
                          ✕
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2 sm:grid-cols-4">
                        <Field label="Balance">
                          <MoneyInput
                            value={d.balance}
                            onChange={(balance) =>
                              updateDebt(d.id, {
                                balance,
                                original: d.original || balance,
                              })
                            }
                          />
                        </Field>
                        <Field label="APR">
                          <PercentInput value={d.apr} onChange={(apr) => updateDebt(d.id, { apr })} />
                        </Field>
                        <Field label="Minimum">
                          <MoneyInput
                            value={d.minPayment}
                            onChange={(minPayment) => updateDebt(d.id, { minPayment })}
                          />
                        </Field>
                        <Field label="Original">
                          <MoneyInput
                            value={d.original || d.balance}
                            onChange={(original) => updateDebt(d.id, { original })}
                          />
                        </Field>
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
          <div className="min-w-0 space-y-4">
            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              <StatCard
                label="Debt-free date"
                value={
                  result.cleared && result.debtFreeDate
                    ? formatMonthYearLong(result.debtFreeDate)
                    : "Beyond 10 years"
                }
                hint={
                  result.cleared
                    ? `${result.months} months`
                    : "Raise extra, or check a minimum that doesn’t cover interest."
                }
                tone={result.cleared ? "teal" : "warn"}
              />
              <StatCard
                label="Total interest"
                value={formatMoney(result.totalInterest)}
                hint={
                  result.interestSaved != null
                    ? `${formatMoney(result.interestSaved)} saved vs minimums only`
                    : "A minimum doesn’t cover interest — extra can still retire it."
                }
              />
              <StatCard label="Monthly outlay" value={formatMoney(result.monthlyOutlay)} hint="Minimums + extra" />
              <StatCard
                label="Remaining now"
                value={formatMoney(result.remainingStart)}
                hint={`of ${formatMoney(result.originalTotal)} original`}
              />
            </div>
            <Card className="p-5">
              <ProgressBar value={paidDown} label="Paid down vs original balances" />
              <p className="mt-3 break-words text-sm text-muted">
                Order: {result.orderNames.join(" → ") || "Add a debt to get started."}
              </p>
            </Card>
            <Card className="p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-serif text-lg text-ink">Month-by-month</h2>
                <ResultsActions
                  tool={tool.shortName}
                  summary={summary}
                  onSave={() => setSaveOpen(true)}
                  onExport={exportCsv}
                  onPrint={() => window.print()}
                />
              </div>
              <MonthTable
                headers={["Month", "Focus", "Paid", "Interest", "Remaining"]}
                rows={result.schedule.map((m) => [
                  formatMonthYearLong(m.date),
                  m.targetName ?? "—",
                  formatMoney(m.paid),
                  formatMoney(m.interest),
                  formatMoney(m.remaining),
                ])}
              />
            </Card>
            {isPro ? (
              <Card className="p-5">
                <h2 className="font-serif text-lg text-ink">Snowball vs Avalanche</h2>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs uppercase tracking-wide text-muted">
                      <tr>
                        <th className="py-2 text-left font-medium">Method</th>
                        <th className="py-2 text-left font-medium">Debt-free</th>
                        <th className="py-2 text-left font-medium">Interest</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(
                        [
                          ["Snowball", comparison.snowball],
                          ["Avalanche", comparison.avalanche],
                        ] as const
                      ).map(([label, r]) => (
                        <tr key={label} className="border-t border-line-soft">
                          <td className="py-2">{label}</td>
                          <td className="py-2">
                            {r.cleared && r.debtFreeDate ? formatMonthYearLong(r.debtFreeDate) : "Beyond 10 years"}
                            <span className="text-muted"> · {r.months} mo</span>
                          </td>
                          <td className="py-2 tabular">{formatMoney(r.totalInterest)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-sm text-muted">
                  Avalanche saves{" "}
                  {formatMoney(comparison.snowball.totalInterest - comparison.avalanche.totalInterest)} in interest vs
                  Snowball on this plan. Snowball may still feel better if you want quick wins.
                </p>
              </Card>
            ) : (
              <Card className="p-5">
                <p className="text-sm text-muted">
                  Avalanche on this plan:{" "}
                  <span className="font-medium text-ink">
                    {comparison.avalanche.cleared && comparison.avalanche.debtFreeDate
                      ? formatMonthYearLong(comparison.avalanche.debtFreeDate)
                      : "beyond 10 years"}
                  </span>
                  , {formatMoney(comparison.avalanche.totalInterest)} interest. Unlock Pro for the full side-by-side.
                </p>
              </Card>
            )}
            <SpreadsheetCard productId={tool.spreadsheetProductId} light={isPro} />
          </div>
        }
      />
      <SavePlanModal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        tool="debt-payoff"
        payload={{ method, extra, start: start.toISOString(), debts }}
      />
    </>
  );
}
