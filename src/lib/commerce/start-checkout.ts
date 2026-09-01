export async function startStripeCheckout(offerId: string): Promise<{ url?: string; error?: string }> {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ offerId }),
  });
  const data = (await res.json()) as { url?: string; error?: string };
  if (data.url) return { url: data.url };
  return { error: data.error ?? "Could not start checkout." };
}

export function goToStripeCheckout(url: string) {
  globalThis.location.assign(url);
}
