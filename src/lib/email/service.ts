export type EmailPayload = {
  email: string;
  name?: string;
  tool: string;
  summary: string;
};

export type RestoreEmailPayload = {
  email: string;
  url: string;
};

export type EmailService = {
  sendPlan(payload: EmailPayload): Promise<{ ok: boolean }>;
  sendRestoreLink(payload: RestoreEmailPayload): Promise<{ ok: boolean; sent: boolean }>;
};

/** Resend when RESEND_API_KEY is set. Otherwise capture only. */
export const emailService: EmailService = {
  async sendPlan() {
    return { ok: true };
  },
  async sendRestoreLink(payload) {
    const key = process.env.RESEND_API_KEY;
    const from = process.env.RESTORE_FROM_EMAIL ?? "Harbor <noreply@harbor.local>";
    if (!key) return { ok: true, sent: false };
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [payload.email],
        subject: "Restore your Harbor purchase",
        text: `Open this link on the device you want to use. It expires in 30 minutes.\n\n${payload.url}\n`,
      }),
    });
    return { ok: res.ok, sent: res.ok };
  },
};
