import type { Metadata } from "next";
import { Suspense } from "react";
import { getTool } from "../../../data/tools";
import { PaycheckBudgetTool } from "../../../components/tools/PaycheckBudgetTool";

const tool = getTool("paycheck-budget");

export const metadata: Metadata = {
  title: tool.seoTitle,
  description: tool.seoDescription,
};

export default function PaycheckBudgetPage() {
  return (
    <Suspense>
      <PaycheckBudgetTool />
    </Suspense>
  );
}
