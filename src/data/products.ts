import { CORE_TEMPLATE_IDS, PRICES, templateOffer, type Offer } from "../config/pricing";

export type SpreadsheetProduct = {
  id: string;
  name: string;
  blurb: string;
  href: string;
  fileName: string | null;
  relatedToolHref: string | null;
  highlights: string[];
  /** In the $29 “all 3” bundle. */
  core: boolean;
  extra?: boolean;
  comingSoon?: boolean;
};

export const products: SpreadsheetProduct[] = [
  {
    id: "debt-payoff-tracker",
    name: "Debt Payoff Tracker & Schedule",
    blurb:
      "Snowball or Avalanche for up to eight debts, a 120-month schedule, payment log, and a side-by-side comparison.",
    href: "/spreadsheets#debt-payoff-tracker",
    fileName: "Debt-Payoff-Tracker-Schedule.xlsx",
    relatedToolHref: "/tools/debt-payoff",
    core: true,
    highlights: [
      "Payment log that doesn’t rewrite the projection",
      "Snowball vs Avalanche comparison sheet",
      "Works in Excel and Google Sheets",
    ],
  },
  {
    id: "paycheck-budget-tracker",
    name: "Paycheck Budget + Bill Tracker",
    blurb:
      "Budget by paycheck. Recurring bills, category actuals, a transaction log, and leftover after bills and after the plan.",
    href: "/spreadsheets#paycheck-budget-tracker",
    fileName: "Paycheck-Budget-Bill-Tracker.xlsx",
    relatedToolHref: "/tools/paycheck-budget",
    core: true,
    highlights: [
      "Bills hit the paycheck that contains the due date",
      "Transaction log vs the plan",
      "Works in Excel and Google Sheets",
    ],
  },
  {
    id: "cash-flow-forecast",
    name: "Cash Flow Forecast Spreadsheet",
    blurb:
      "Monthly running balance, one-time hits, and a 12-month chart. The keep-using version of the free forecast.",
    href: "/spreadsheets#cash-flow-forecast",
    fileName: "Cash-Flow-Forecast.xlsx",
    relatedToolHref: "/tools/cash-flow",
    core: true,
    highlights: ["12-month running balance", "One-time income and expenses", "Excel and Google Sheets"],
  },
  {
    id: "online-seller-profit-tracker",
    name: "Online Seller Profit Tracker",
    blurb:
      "Etsy, Shopify, Gumroad, and similar shops. Track sales, fees, COGS, and what you actually keep.",
    href: "/spreadsheets#online-seller-profit-tracker",
    fileName: "Online-Seller-Profit-Tracker.xlsx",
    relatedToolHref: null,
    core: false,
    extra: true,
    highlights: ["Per-order profit", "Monthly summary through 2028", "Excel and Google Sheets"],
  },
  {
    id: "transaction-reconciliation-matcher",
    name: "Transaction Reconciliation Matcher",
    blurb:
      "Match two lists — bank vs books, card vs expense log — and see matched, unmatched, and amount differences.",
    href: "/spreadsheets#transaction-reconciliation-matcher",
    fileName: "Transaction-Reconciliation-Matcher.xlsx",
    relatedToolHref: null,
    core: false,
    extra: true,
    highlights: ["Date + amount, IDs, or manual pairs", "Tolerance for small diffs", "Excel and Google Sheets"],
  },
  {
    id: "project-management-tracker",
    name: "Project Management Tracker",
    blurb:
      "Projects, tasks, milestones, and an 18-week Gantt. Built for a small team that lives in a spreadsheet.",
    href: "/spreadsheets#project-management-tracker",
    fileName: "Project-Management-Tracker.xlsx",
    relatedToolHref: null,
    core: false,
    extra: true,
    highlights: ["Health from the task list", "Overdue and upcoming", "Excel and Google Sheets"],
  },
];

export function getProduct(id: string): SpreadsheetProduct | undefined {
  return products.find((p) => p.id === id);
}

export function offerForProduct(product: SpreadsheetProduct): Offer {
  return templateOffer(product.id, product.name, product.blurb);
}

export const coreProducts = products.filter((p) => p.core);
export const extraProducts = products.filter((p) => p.extra);

export { PRICES, CORE_TEMPLATE_IDS };
