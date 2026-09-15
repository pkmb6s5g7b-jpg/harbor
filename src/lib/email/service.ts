import { PRICES, formatPrice } from "../../config/pricing";
import { readEnv } from "../stripe";

export type EmailPayload = {
  email: string;
  name?: string;
  tool: string;
  summary: string;
};

function fromAddress(): string {
  return readEnv("RESULTS_FROM_EMAIL") || "Harbor <hello@getharborplans.com>";
}

function siteUrl(): string {
  return (readEnv("NEXT_PUBLIC_SITE_URL") || "https://www.getharborplans.com").replace(/\/$/, "");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type ToolLinks = {
  calculatorPath: string;
  spreadsheetName: string;
  spreadsheetHash: string;
};

function linksForTool(tool: string): ToolLinks {
  const name = tool.toLowerCase();
  if (name.includes("debt")) {
    return {
      calculatorPath: "/tools/debt-payoff",
      spreadsheetName: "Debt Payoff Tracker spreadsheet",
      spreadsheetHash: "debt-payoff-tracker",
    };
  }
  if (name.includes("paycheck") || name.includes("budget")) {
    return {
      calculatorPath: "/tools/paycheck-budget",
      spreadsheetName: "Paycheck Budget + Bill Tracker spreadsheet",
      spreadsheetHash: "paycheck-budget-tracker",
    };
  }
  return {
    calculatorPath: "/tools/cash-flow",
    spreadsheetName: "Cash Flow Forecast spreadsheet",
    spreadsheetHash: "cash-flow-forecast",
  };
}

function buildEmail(payload: EmailPayload): { subject: string; text: string; html: string } {
  const origin = siteUrl();
  const links = linksForTool(payload.tool);
  const calculator = `${origin}${links.calculatorPath}`;
  const spreadsheet = `${origin}/templates#${links.spreadsheetHash}`;
  const templates = `${origin}/templates`;
  const pricing = `${origin}/pricing`;
  const restore = `${origin}/restore`;
  const tools = `${origin}/tools`;
  const greeting = payload.name ? `Hi ${payload.name},` : "Hi,";
  const sheetPrice = formatPrice(PRICES.spreadsheet);
  const bundlePrice = formatPrice(PRICES.bundle);
  const proPrice = formatPrice(PRICES.pro);

  const subject = `Your Harbor ${payload.tool} plan`;

  const text = `${greeting}

Here’s a snapshot of the ${payload.tool} plan you ran on Harbor.

${payload.summary.trim()}

Come back to this calculator (numbers stay in the browser you used unless you save with Pro):
${calculator}

All free tools: ${tools}

Want a file you can keep in Excel or Google Sheets?
• ${links.spreadsheetName} — ${sheetPrice}
  ${spreadsheet}
• All 3 core spreadsheets — ${bundlePrice}
  ${templates}

Harbor Pro (${proPrice}, one-time) saves named plans, CSV export, and print reports in the browser:
${pricing}

Paid on another device? Restore with your Stripe receipt email:
${restore}

Harbor is a planning tool, not financial advice.

— Harbor
${origin}
`;

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:Georgia,serif;color:#1a2a32;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2ebe8;border-radius:12px;">
          <tr>
            <td style="padding:28px 28px 8px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#3d8b80;">Harbor</td>
          </tr>
          <tr>
            <td style="padding:0 28px 8px;font-size:24px;line-height:1.3;color:#1b4f72;">Your ${escapeHtml(payload.tool)} plan</td>
          </tr>
          <tr>
            <td style="padding:0 28px 20px;font-size:16px;line-height:1.5;color:#1a2a32;">${escapeHtml(greeting)}</td>
          </tr>
          <tr>
            <td style="padding:0 28px 8px;font-size:15px;line-height:1.6;color:#4a5c63;">Here’s the snapshot you asked us to email. Open the calculator again on the same device to keep editing.</td>
          </tr>
          <tr>
            <td style="padding:8px 28px 20px;">
              <div style="background:#f4f7f6;border-radius:10px;padding:16px 18px;font-size:16px;line-height:1.55;color:#1a2a32;">${escapeHtml(payload.summary.trim())}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 22px;">
              <a href="${escapeHtml(calculator)}" style="display:inline-block;background:#1b4f72;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-size:14px;font-family:Arial,sans-serif;">Open this calculator</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 6px;font-size:18px;color:#1b4f72;">Keep going</td>
          </tr>
          <tr>
            <td style="padding:0 28px 18px;font-size:15px;line-height:1.65;color:#4a5c63;">
              <a href="${escapeHtml(spreadsheet)}" style="color:#1b4f72;">${escapeHtml(links.spreadsheetName)}</a> — ${sheetPrice} one-time, Excel + Google Sheets<br />
              <a href="${escapeHtml(templates)}" style="color:#1b4f72;">All 3 core spreadsheets</a> — ${bundlePrice}<br />
              <a href="${escapeHtml(pricing)}" style="color:#1b4f72;">Harbor Pro</a> — ${proPrice} one-time to save named plans, export CSV, and print in the browser
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 24px;font-size:14px;line-height:1.6;color:#4a5c63;">
              All free tools: <a href="${escapeHtml(tools)}" style="color:#1b4f72;">${escapeHtml(tools)}</a><br />
              Restore a purchase: <a href="${escapeHtml(restore)}" style="color:#1b4f72;">${escapeHtml(restore)}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px;font-size:12px;line-height:1.5;color:#7a8b91;">Harbor is a planning tool, not financial advice. This snapshot is not a full copy of your plan — numbers stay in the browser unless you save with Pro or keep the spreadsheet file.</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

export async function sendPlan(payload: EmailPayload): Promise<void> {
  const key = readEnv("RESEND_API_KEY");
  if (!key) {
    throw new Error("Email sending is not configured.");
  }
  const { subject, text, html } = buildEmail(payload);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [payload.email],
      reply_to: readEnv("RESULTS_REPLY_TO") || "harborplans@outlook.com",
      subject,
      text,
      html,
    }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? "Could not send that email.");
  }
}
