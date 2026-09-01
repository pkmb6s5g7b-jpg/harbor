import { storageKeys } from "../../config/brand";
import type { ToolSlug } from "../../data/tools";
import type { Plan, StorageAdapter } from "./types";

const purchaseCache: { raw: string | null; value: string[] } = { raw: null, value: [] };

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export const localStorageAdapter: StorageAdapter = {
  getPro() {
    if (readJson(storageKeys.pro, false)) return true;
    return readJson<string[]>(storageKeys.purchases, []).includes("pro");
  },
  setPro(value) {
    writeJson(storageKeys.pro, value);
  },
  getDraft(tool) {
    const drafts = readJson<Partial<Record<ToolSlug, unknown>>>(storageKeys.drafts, {});
    return drafts[tool] ?? null;
  },
  setDraft(tool, payload) {
    const drafts = readJson<Partial<Record<ToolSlug, unknown>>>(storageKeys.drafts, {});
    drafts[tool] = payload;
    writeJson(storageKeys.drafts, drafts);
  },
  listPlans(tool) {
    const plans = readJson<Plan[]>(storageKeys.plans, []);
    return tool ? plans.filter((p) => p.tool === tool) : plans;
  },
  savePlan(plan) {
    if (!this.getPro()) return { ok: false, reason: "pro-required" };
    const plans = readJson<Plan[]>(storageKeys.plans, []);
    const idx = plans.findIndex((p) => p.id === plan.id);
    if (idx >= 0) plans[idx] = plan;
    else plans.unshift(plan);
    writeJson(storageKeys.plans, plans);
    return { ok: true };
  },
  deletePlan(id) {
    const plans = readJson<Plan[]>(storageKeys.plans, []).filter((p) => p.id !== id);
    writeJson(storageKeys.plans, plans);
  },
  listEmails() {
    return readJson(storageKeys.emails, []);
  },
  addEmail(email, name) {
    const list = readJson<{ email: string; name?: string; at: string }[]>(storageKeys.emails, []);
    list.unshift({ email, name, at: new Date().toISOString() });
    writeJson(storageKeys.emails, list);
  },
  getPurchases() {
    if (typeof window === "undefined") return purchaseCache.value;
    const raw = window.localStorage.getItem(storageKeys.purchases);
    if (raw === purchaseCache.raw) return purchaseCache.value;
    purchaseCache.raw = raw;
    purchaseCache.value = raw ? (JSON.parse(raw) as string[]) : [];
    return purchaseCache.value;
  },
  addPurchases(skus) {
    const next = [...new Set([...this.getPurchases(), ...skus])];
    writeJson(storageKeys.purchases, next);
    purchaseCache.raw = JSON.stringify(next);
    purchaseCache.value = next;
    return next;
  },
  clearDevice() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(storageKeys.pro);
    window.localStorage.removeItem(storageKeys.purchases);
    window.localStorage.removeItem(storageKeys.plans);
    window.localStorage.removeItem(storageKeys.drafts);
    purchaseCache.raw = null;
    purchaseCache.value = [];
  },
};
