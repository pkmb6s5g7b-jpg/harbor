import { get, list, put } from "@vercel/blob";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { expandGrants } from "./entitlements";

export type PurchaseRecord = {
  sessionId: string;
  offerId: string;
  grants: string[];
  email: string | null;
  amountTotal: number | null;
  currency: string | null;
  paidAt: string;
};

/**
 * One row per paid Checkout Session.
 * Production writes a private Vercel Blob at sales/{sessionId}.json (needs a
 * connected private store: BLOB_STORE_ID or BLOB_READ_WRITE_TOKEN).
 * Local dev, with neither set, appends .data/purchases.json.
 * A repeated session id is a no-op.
 */
const SALES_PREFIX = "sales/";

type CheckoutSessionLike = {
  id: string;
  payment_status: string | null;
  metadata: { offerId?: string; grants?: string } | null;
  customer_details: { email?: string | null } | null;
  customer_email: string | null;
  amount_total: number | null;
  currency: string | null;
};

export function purchaseFromCheckoutSession(
  session: CheckoutSessionLike,
  paidAt = new Date().toISOString(),
): PurchaseRecord | null {
  if (session.payment_status !== "paid" || !session.id) return null;
  return {
    sessionId: session.id,
    offerId: session.metadata?.offerId ?? "",
    grants: expandGrants((session.metadata?.grants ?? "").split(",").filter(Boolean)),
    email: session.customer_details?.email ?? session.customer_email ?? null,
    amountTotal: session.amount_total,
    currency: session.currency,
    paidAt,
  };
}

function blobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim() || process.env.BLOB_STORE_ID?.trim());
}

function purchasesFile(): string {
  const requested = process.env.PURCHASES_FILE_NAME?.trim() || "purchases.json";
  const name = /^[\w.-]+$/.test(requested) ? requested : "purchases.json";
  return path.join(process.cwd(), ".data", name);
}

function salesPath(sessionId: string): string {
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
    throw new Error("Refusing to store a sales record with an unexpected session id.");
  }
  return `${SALES_PREFIX}${sessionId}.json`;
}

function isRecord(value: unknown): value is PurchaseRecord {
  if (!value || typeof value !== "object") return false;
  const row = value as Partial<PurchaseRecord>;
  return typeof row.sessionId === "string" && Array.isArray(row.grants);
}

async function readBlob(pathname: string): Promise<PurchaseRecord | undefined> {
  const result = await get(pathname, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200) return undefined;
  const text = await new Response(result.stream).text();
  const parsed = JSON.parse(text) as unknown;
  return isRecord(parsed) ? parsed : undefined;
}

async function recordInBlob(row: PurchaseRecord): Promise<void> {
  const pathname = salesPath(row.sessionId);
  if (await readBlob(pathname)) return;
  try {
    await put(pathname, JSON.stringify(row), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: false,
      contentType: "application/json",
    });
  } catch (err) {
    if (await readBlob(pathname)) return;
    throw err;
  }
}

async function readAllFiles(): Promise<PurchaseRecord[]> {
  try {
    const raw = await readFile(purchasesFile(), "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRecord);
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "ENOENT") return [];
    throw err;
  }
}

async function recordInFile(row: PurchaseRecord): Promise<void> {
  salesPath(row.sessionId);
  const file = purchasesFile();
  const all = await readAllFiles();
  if (all.some((p) => p.sessionId === row.sessionId)) return;
  all.push(row);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(all, null, 2));
}

async function listAll(): Promise<PurchaseRecord[]> {
  if (!blobConfigured()) return readAllFiles();
  const rows: PurchaseRecord[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: SALES_PREFIX, cursor, limit: 1000 });
    for (const blob of page.blobs) {
      if (!blob.pathname.endsWith(".json")) continue;
      try {
        const row = await readBlob(blob.pathname);
        if (row) rows.push(row);
      } catch (err) {
        console.error("sales log skip", blob.pathname, err);
      }
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return rows;
}

export async function recordPurchase(row: PurchaseRecord): Promise<void> {
  if (blobConfigured()) {
    await recordInBlob(row);
    return;
  }
  await recordInFile(row);
}

export async function findPurchase(sessionId: string): Promise<PurchaseRecord | undefined> {
  if (blobConfigured()) {
    try {
      return await readBlob(salesPath(sessionId));
    } catch (err) {
      console.error("findPurchase failed", err);
      return undefined;
    }
  }
  const all = await readAllFiles();
  return all.find((p) => p.sessionId === sessionId);
}

export async function listPurchasesByEmail(email: string): Promise<PurchaseRecord[]> {
  const want = email.trim().toLowerCase();
  const all = await listAll();
  return all.filter((p) => (p.email ?? "").trim().toLowerCase() === want);
}
