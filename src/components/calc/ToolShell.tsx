import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "../layout/Container";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

export function ToolShell({
  title,
  description,
  isSample,
  onLoadSample,
  onReset,
  inputs,
  results,
}: {
  title: string;
  description: string;
  isSample: boolean;
  onLoadSample: () => void;
  onReset: () => void;
  inputs: ReactNode;
  results: ReactNode;
}) {
  return (
    <div className="py-8 sm:py-10">
      <Container>
        <p className="text-sm text-muted">
          <Link href="/" className="hover:text-navy">
            Home
          </Link>
          <span className="px-2">/</span>
          <span>Tools</span>
          <span className="px-2">/</span>
          <span className="text-ink">{title}</span>
        </p>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl tracking-tight text-ink sm:text-4xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-muted">{description}</p>
          </div>
          <div className="no-print flex flex-wrap items-center gap-2">
            {isSample ? <Badge tone="teal">Showing sample plan</Badge> : null}
            <Button variant="ghost" size="sm" onClick={onLoadSample}>
              Load sample
            </Button>
            <Button variant="ghost" size="sm" onClick={onReset}>
              Reset
            </Button>
          </div>
        </div>
        <div className="mt-8 grid min-w-0 items-start gap-6 lg:grid-cols-5">
          <div className="min-w-0 lg:col-span-2">{inputs}</div>
          <div id="results" className="min-w-0 lg:col-span-3">
            {results}
          </div>
        </div>
      </Container>
    </div>
  );
}
