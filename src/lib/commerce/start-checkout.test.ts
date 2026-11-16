import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";
import { startStripeCheckout } from "./start-checkout";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("startStripeCheckout", { concurrency: 1 }, () => {
  test("returns a checkout url without retrying", async () => {
    let calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      return jsonResponse({ url: "https://checkout.stripe.com/c/pay/cs_test_ok" });
    };
    const started = Date.now();
    const result = await startStripeCheckout("pro");
    assert.deepEqual(result, { url: "https://checkout.stripe.com/c/pay/cs_test_ok" });
    assert.equal(calls, 1);
    assert.ok(Date.now() - started < 150);
  });

  test("returns a JSON client error without retrying", async () => {
    let calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      return jsonResponse({ error: "Unknown offer" }, 400);
    };
    const result = await startStripeCheckout("nope");
    assert.deepEqual(result, { error: "Unknown offer" });
    assert.equal(calls, 1);
  });

  test("retries one empty 500 and then uses the checkout url", async () => {
    let calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      if (calls === 1) return new Response("", { status: 500 });
      return jsonResponse({ url: "https://checkout.stripe.com/c/pay/cs_test_retry" });
    };
    const result = await startStripeCheckout("core-bundle");
    assert.deepEqual(result, { url: "https://checkout.stripe.com/c/pay/cs_test_retry" });
    assert.equal(calls, 2);
  });

  test("retries a non-JSON 5xx once, then returns a friendly message", async () => {
    let calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      return new Response("<html>nope</html>", { status: 500 });
    };
    const result = await startStripeCheckout("pro");
    assert.equal(calls, 2);
    assert.equal(result.url, undefined);
    assert.match(result.error ?? "", /temporarily unavailable/i);
  });

  test("retries a network failure once, then returns a friendly message", async () => {
    let calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      throw new Error("socket hang up");
    };
    const result = await startStripeCheckout("pro");
    assert.equal(calls, 2);
    assert.match(result.error ?? "", /temporarily unavailable/i);
  });

  test("hides a JSON 5xx message behind the friendly error after one retry", async () => {
    let calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      return jsonResponse({ error: "sk_test_51ShouldNotLeak" }, 500);
    };
    const result = await startStripeCheckout("pro");
    assert.equal(calls, 2);
    assert.match(result.error ?? "", /temporarily unavailable/i);
    assert.equal((result.error ?? "").includes("sk_test_"), false);
  });
});
