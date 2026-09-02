import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type PurchaseRecord = {
  sessionId: string;
  offerId: string;
  grants: string[];
  email: string | null;
  amountTotal: number | null;
  currency: string | null;
  paidAt: string;
};

const FILE = path.join(process.cwd(), ".data", "purchases.json");

async function readAll(): Promise<PurchaseRecord[]> {
  try {
    const raw = await readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as PurchaseRecord[]) : [];
  } catch {
    return [];
  }
}

export async function recordPurchase(row: PurchaseRecord): Promise<void> {
  try {
    const all = await readAll();
    if (all.some((p) => p.sessionId === row.sessionId)) return;
    all.push(row);
    await mkdir(path.dirname(FILE), { recursive: true });
    await writeFile(FILE, JSON.stringify(all, null, 2));
  } catch (err) {
    // Vercel’s filesystem is read-only except /tmp. Unlock still uses Stripe + cookies.
    console.error("recordPurchase skipped", err);
  }
}

export async function findPurchase(sessionId: string): Promise<PurchaseRecord | undefined> {
  const all = await readAll();
  return all.find((p) => p.sessionId === sessionId);
}

export async function listPurchasesByEmail(email: string): Promise<PurchaseRecord[]> {
  const want = email.trim().toLowerCase();
  const all = await readAll();
  return all.filter((p) => (p.email ?? "").trim().toLowerCase() === want);
}
