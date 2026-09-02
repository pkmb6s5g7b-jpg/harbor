import { createHmac, timingSafeEqual } from "node:crypto";
import { readEnv } from "../stripe";

export type RestoreToken = {
  hash: string;
  email: string;
  grants: string[];
  exp: number;
  used: boolean;
};

const TTL_MS = 30 * 60 * 1000;

function signingKey(): string {
  const key = readEnv("STRIPE_SECRET_KEY");
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY for restore links.");
  return key;
}

function b64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

function sign(payloadB64: string): string {
  return createHmac("sha256", signingKey()).update(`v1.${payloadB64}`).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function issueRestoreToken(email: string, grants: string[]): Promise<string> {
  const payload = JSON.stringify({
    email,
    grants,
    exp: Date.now() + TTL_MS,
  });
  const payloadB64 = b64url(payload);
  return `v1.${payloadB64}.${sign(payloadB64)}`;
}

export async function consumeRestoreToken(token: string): Promise<RestoreToken | null> {
  const parts = token.trim().split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return null;
  const [, payloadB64, mac] = parts;
  if (!payloadB64 || !mac || !safeEqual(mac, sign(payloadB64))) return null;

  let parsed: { email?: string; grants?: unknown; exp?: number };
  try {
    parsed = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as typeof parsed;
  } catch {
    return null;
  }
  if (!parsed.email || typeof parsed.exp !== "number" || parsed.exp < Date.now()) return null;
  if (!Array.isArray(parsed.grants)) return null;

  return {
    hash: mac,
    email: parsed.email,
    grants: parsed.grants.filter((g): g is string => typeof g === "string"),
    exp: parsed.exp,
    used: false,
  };
}
