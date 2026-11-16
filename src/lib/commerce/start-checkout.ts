const CHECKOUT_RETRY_DELAY_MS = 200;
const FRIENDLY_CHECKOUT_ERROR = "Checkout is temporarily unavailable. Please try again.";

type CheckoutPayload = { url?: string; error?: string };

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function readCheckoutPayload(res: Response): Promise<CheckoutPayload | null> {
  const text = await res.text();
  if (!text.trim()) return null;
  try {
    const parsed = JSON.parse(text) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const record = parsed as { url?: unknown; error?: unknown };
    return {
      url: typeof record.url === "string" ? record.url : undefined,
      error: typeof record.error === "string" ? record.error : undefined,
    };
  } catch {
    return null;
  }
}

async function requestCheckout(offerId: string): Promise<{ res: Response | null; data: CheckoutPayload | null }> {
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offerId }),
    });
    return { res, data: await readCheckoutPayload(res) };
  } catch {
    return { res: null, data: null };
  }
}

function shouldRetry(res: Response | null, data: CheckoutPayload | null): boolean {
  if (data?.url) return false;
  if (!res || res.status >= 500 || data === null) return true;
  return false;
}

function checkoutResult(res: Response | null, data: CheckoutPayload | null): CheckoutPayload {
  if (data?.url) return { url: data.url };
  if (res && res.status < 500 && data) {
    return { error: data.error ?? "Could not start checkout." };
  }
  return { error: FRIENDLY_CHECKOUT_ERROR };
}

export async function startStripeCheckout(offerId: string): Promise<CheckoutPayload> {
  let { res, data } = await requestCheckout(offerId);
  if (shouldRetry(res, data)) {
    await sleep(CHECKOUT_RETRY_DELAY_MS);
    ({ res, data } = await requestCheckout(offerId));
  }
  return checkoutResult(res, data);
}

export function goToStripeCheckout(url: string) {
  globalThis.location.assign(url);
}
