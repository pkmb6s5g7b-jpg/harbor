import assert from "node:assert/strict";
import { describe, mock, test } from "node:test";

mock.module("server-only", { namedExports: {} });

const route = import("../../app/api/checkout/route");

function checkoutRequest(body: string) {
  return new Request("http://localhost/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

async function post(req: Request) {
  const { POST } = await route;
  return POST(req);
}

describe("POST /api/checkout", () => {
  test("empty and malformed JSON return a JSON 400", async () => {
    for (const body of ["", "   ", "{", "not-json"]) {
      const res = await post(checkoutRequest(body));
      assert.equal(res.status, 400);
      assert.match(res.headers.get("content-type") ?? "", /application\/json/);
      assert.deepEqual(await res.json(), { error: "Invalid JSON body" });
    }
  });

  test("JSON null returns a JSON 400", async () => {
    const res = await post(checkoutRequest("null"));
    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { error: "Invalid JSON body" });
  });

  test("an unknown offer stays a JSON 400", async () => {
    const res = await post(checkoutRequest("{}"));
    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { error: "Unknown offer" });
  });

  test("a known offer stays a JSON response when Stripe is not configured", async () => {
    const previous = process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_SECRET_KEY;
    try {
      const res = await post(checkoutRequest(JSON.stringify({ offerId: "pro" })));
      assert.equal(res.status, 503);
      const data = (await res.json()) as { error?: string };
      assert.match(data.error ?? "", /Stripe is not configured/);
    } finally {
      if (previous === undefined) delete process.env.STRIPE_SECRET_KEY;
      else process.env.STRIPE_SECRET_KEY = previous;
    }
  });

  test("unexpected errors are logged without secrets and returned as JSON 500", async () => {
    const secret = "sk_test_51AbCdEf012345";
    const logs: unknown[][] = [];
    const original = console.error;
    console.error = (...args: unknown[]) => {
      logs.push(args);
    };
    try {
      const req = new Request("http://localhost/api/checkout", { method: "POST", body: "{}" });
      req.json = async () => {
        throw new Error(`Stripe request failed using ${secret}`);
      };
      const res = await post(req);
      assert.equal(res.status, 500);
      assert.match(res.headers.get("content-type") ?? "", /application\/json/);
      const data = (await res.json()) as { error?: string };
      assert.equal(data.error?.includes(secret), false);
      assert.match(data.error ?? "", /\[redacted\]/);
      const logged = JSON.stringify(logs);
      assert.equal(logged.includes(secret), false);
      assert.match(logged, /checkout failed/);
    } finally {
      console.error = original;
    }
  });
});
