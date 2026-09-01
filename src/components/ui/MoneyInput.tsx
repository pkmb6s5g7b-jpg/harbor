"use client";

import { useState } from "react";
import { parseMoney } from "../../lib/money";
import { Input } from "./Input";

export function MoneyInput({
  value,
  onChange,
  id,
  name,
  disabled,
}: {
  value: number;
  onChange: (n: number) => void;
  id?: string;
  name?: string;
  disabled?: boolean;
}) {
  const [raw, setRaw] = useState(value ? String(value) : "");
  const [focused, setFocused] = useState(false);

  const display = focused ? raw : value ? value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : "";

  return (
    <div className="relative w-full min-w-0">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
      <Input
        id={id}
        name={name}
        inputMode="decimal"
        disabled={disabled}
        className="pl-7 tabular"
        value={display}
        onFocus={() => {
          setFocused(true);
          setRaw(value ? String(value) : "");
        }}
        onBlur={() => {
          setFocused(false);
          onChange(parseMoney(raw));
        }}
        onChange={(e) => {
          setRaw(e.target.value);
          onChange(parseMoney(e.target.value));
        }}
      />
    </div>
  );
}

export function PercentInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const pct = value * 100;
  const [raw, setRaw] = useState(pct ? String(Number(pct.toFixed(2))) : "");
  const [focused, setFocused] = useState(false);
  const display = focused ? raw : pct ? Number(pct.toFixed(2)).toString() : "";

  return (
    <div className="relative w-full min-w-0">
      <Input
        inputMode="decimal"
        className="pr-8 tabular"
        value={display}
        onFocus={() => {
          setFocused(true);
          setRaw(pct ? String(Number(pct.toFixed(2))) : "");
        }}
        onBlur={() => {
          setFocused(false);
          const n = Number.parseFloat(raw);
          onChange(Number.isFinite(n) ? n / 100 : 0);
        }}
        onChange={(e) => {
          setRaw(e.target.value);
          const n = Number.parseFloat(e.target.value);
          onChange(Number.isFinite(n) ? n / 100 : 0);
        }}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">%</span>
    </div>
  );
}
