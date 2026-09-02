export type EmailPayload = {
  email: string;
  name?: string;
  tool: string;
  summary: string;
};

export type EmailService = {
  sendPlan(payload: EmailPayload): Promise<{ ok: boolean }>;
};

/** Optional snapshot email. Restore links are shown on the Restore page, not emailed. */
export const emailService: EmailService = {
  async sendPlan() {
    return { ok: true };
  },
};
