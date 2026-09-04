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

export async function sendPlan(payload: EmailPayload): Promise<void> {
  const key = readEnv("RESEND_API_KEY");
  if (!key) {
    throw new Error("Email sending is not configured.");
  }
  const greeting = payload.name ? `Hi ${payload.name},\n\n` : "";
  const text = `${greeting}Here’s a snapshot of your ${payload.tool} plan from Harbor.\n\n${payload.summary.trim()}\n\nThis is not financial advice. Plans also stay in the browser you used.\n`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [payload.email],
      subject: `Your ${payload.tool} plan`,
      text,
    }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? "Could not send that email.");
  }
}
