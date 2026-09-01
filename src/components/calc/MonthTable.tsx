"use client";

import { useState, type ReactNode } from "react";
import { Button } from "../ui/Button";

export function MonthTable({
  headers,
  rows,
  preview = 6,
}: {
  headers: string[];
  rows: ReactNode[][];
  preview?: number;
}) {
  const [open, setOpen] = useState(false);
  const shown = open ? rows : rows.slice(0, preview);

  return (
    <div className="min-w-0 max-w-full">
      <div className="max-w-full overflow-x-auto rounded-xl border border-line-soft">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead className="bg-page text-xs uppercase tracking-wide text-muted">
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-3 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((row, i) => (
              <tr key={i} className="border-t border-line-soft">
                {row.map((cell, j) => (
                  <td key={j} className="px-3 py-2 tabular">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > preview ? (
        <Button variant="ghost" size="sm" className="mt-2 no-print" onClick={() => setOpen((v) => !v)}>
          {open ? "Show fewer months" : `Show all ${rows.length} months`}
        </Button>
      ) : null}
    </div>
  );
}
