import type { Metadata } from "next";
import { Suspense } from "react";
import { getTool } from "../../../data/tools";
import { DebtPayoffTool } from "../../../components/tools/DebtPayoffTool";

const tool = getTool("debt-payoff");

export const metadata: Metadata = {
  title: tool.seoTitle,
  description: tool.seoDescription,
};

export default function DebtPayoffPage() {
  return (
    <Suspense>
      <DebtPayoffTool />
    </Suspense>
  );
}
