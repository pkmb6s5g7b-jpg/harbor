import type { Metadata } from "next";
import { Suspense } from "react";
import { getTool } from "../../../data/tools";
import { CashFlowTool } from "../../../components/tools/CashFlowTool";

const tool = getTool("cash-flow");

export const metadata: Metadata = {
  title: tool.seoTitle,
  description: tool.seoDescription,
};

export default function CashFlowPage() {
  return (
    <Suspense>
      <CashFlowTool />
    </Suspense>
  );
}
