import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type RestoreToken = {
  hash: string;
  email: string;
  grants: string[];
  exp: number;
  used: boolean;
};

const FILE = path.join(process.cwd(), ".data", "restore-tokens.json");
const TTL_MS = 30 * 60 * 1000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function readAll(): Promise<RestoreToken[]> {
  try {
    const raw = await readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as RestoreToken[]) : [];
  } catch {
    return [];
  }
}

async function writeAll(rows: RestoreToken[]): Promise<void> {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(rows, null, 2));
}

export async function issueRestoreToken(email: string, grants: string[]): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const rows = await readAll();
  rows.push({
    hash: hashToken(token),
    email,
    grants,
    exp: Date.now() + TTL_MS,
    used: false,
  });
  await writeAll(rows);
  return token;
}

export async function consumeRestoreToken(token: string): Promise<RestoreToken | null> {
  const hash = hashToken(token);
  const rows = await readAll();
  const row = rows.find((r) => r.hash === hash);
  if (!row || row.used || row.exp < Date.now()) return null;
  row.used = true;
  await writeAll(rows);
  return row;
}
