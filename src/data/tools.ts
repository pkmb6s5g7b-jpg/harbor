export type ToolSlug = "debt-payoff" | "paycheck-budget" | "cash-flow";

export type ToolDef = {
  slug: ToolSlug;
  name: string;
  shortName: string;
  href: string;
  blurb: string;
  seoTitle: string;
  seoDescription: string;
  spreadsheetProductId: string | null;
};

export const tools: ToolDef[] = [
  {
    slug: "debt-payoff",
    name: "Debt Payoff Calculator",
    shortName: "Debt Payoff",
    href: "/tools/debt-payoff",
    blurb: "Snowball or Avalanche. See your debt-free date, interest, and a month-by-month plan.",
    seoTitle: "Debt Snowball vs Avalanche Calculator",
    seoDescription:
      "Free debt payoff calculator. Compare Snowball and Avalanche, add extra payments, and see your debt-free date and interest saved.",
    spreadsheetProductId: "debt-payoff-tracker",
  },
  {
    slug: "paycheck-budget",
    name: "Paycheck Budget Calculator",
    shortName: "Paycheck Budget",
    href: "/tools/paycheck-budget",
    blurb: "Plan one paycheck at a time. Bills, categories, and what’s left before you spend it.",
    seoTitle: "Paycheck Budget Calculator",
    seoDescription:
      "Free paycheck budget calculator for weekly, bi-weekly, or monthly pay. See money left after bills and after your plan.",
    spreadsheetProductId: "paycheck-budget-tracker",
  },
  {
    slug: "cash-flow",
    name: "Cash Flow Forecast",
    shortName: "Cash Flow",
    href: "/tools/cash-flow",
    blurb: "Project 3, 6, or 12 months ahead and catch the months that would go negative.",
    seoTitle: "Cash Flow Forecast Calculator",
    seoDescription:
      "Free cash flow forecast. Enter starting balance, income, and expenses to see your running balance and negative months.",
    spreadsheetProductId: "cash-flow-forecast",
  },
];

export function getTool(slug: ToolSlug): ToolDef {
  const tool = tools.find((t) => t.slug === slug);
  if (!tool) throw new Error(`Unknown tool: ${slug}`);
  return tool;
}
