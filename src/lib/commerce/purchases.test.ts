import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import {
  findPurchase,
  listPurchasesByEmail,
  purchaseFromCheckoutSession,
  recordPurchase,
} from "./purchases";

const paid = {
  id: "cs_test_sale1",
  payment_status: "paid" as const,
  metadata: { offerId: "pro", grants: "pro" },
  customer_details: { email: "Buyer@Example.com" },
  customer_email: null,
  amount_total: 1900,
  currency: "usd",
};

test("sales log ignores unpaid sessions and records a paid session once", async () => {
  const fileName = `purchases-test-${process.pid}.json`;
  const previousFile = process.env.PURCHASES_FILE_NAME;
  const previousToken = process.env.BLOB_READ_WRITE_TOKEN;
  const previousStore = process.env.BLOB_STORE_ID;
  process.env.PURCHASES_FILE_NAME = fileName;
  delete process.env.BLOB_READ_WRITE_TOKEN;
  delete process.env.BLOB_STORE_ID;

  try {
    assert.equal(
      purchaseFromCheckoutSession({ ...paid, payment_status: "unpaid" }, "2026-10-20T00:00:00.000Z"),
      null,
    );

    const row = purchaseFromCheckoutSession(paid, "2026-10-20T00:00:00.000Z");
    assert.ok(row);
    assert.deepEqual(row.grants, ["pro"]);

    await recordPurchase(row);
    await recordPurchase({ ...row, paidAt: "2026-10-21T00:00:00.000Z", amountTotal: 1 });

    const found = await findPurchase(paid.id);
    assert.equal(found?.paidAt, "2026-10-20T00:00:00.000Z");
    assert.equal(found?.amountTotal, 1900);
    assert.equal((await listPurchasesByEmail("buyer@example.com")).length, 1);
    assert.equal((await listPurchasesByEmail("other@example.com")).length, 0);

    const second = purchaseFromCheckoutSession(
      { ...paid, id: "cs_test_sale2", customer_details: { email: "buyer@example.com" } },
      "2026-10-20T01:00:00.000Z",
    );
    assert.ok(second);
    await recordPurchase(second);
    assert.equal((await listPurchasesByEmail("buyer@example.com")).length, 2);
  } finally {
    if (previousFile === undefined) delete process.env.PURCHASES_FILE_NAME;
    else process.env.PURCHASES_FILE_NAME = previousFile;
    if (previousToken === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
    else process.env.BLOB_READ_WRITE_TOKEN = previousToken;
    if (previousStore === undefined) delete process.env.BLOB_STORE_ID;
    else process.env.BLOB_STORE_ID = previousStore;
    await rm(path.join(process.cwd(), ".data", fileName), { force: true });
  }
});
