import type { ToolSlug } from "../../data/tools";

export type Plan = {
  id: string;
  tool: ToolSlug;
  name: string;
  payload: unknown;
  updatedAt: string;
};

export type StorageAdapter = {
  getPro(): boolean;
  setPro(value: boolean): void;
  getDraft(tool: ToolSlug): unknown | null;
  setDraft(tool: ToolSlug, payload: unknown): void;
  listPlans(tool?: ToolSlug): Plan[];
  savePlan(plan: Plan): { ok: true } | { ok: false; reason: "pro-required" };
  deletePlan(id: string): void;
  listEmails(): { email: string; name?: string; at: string }[];
  addEmail(email: string, name?: string): void;
  getPurchases(): string[];
  addPurchases(skus: string[]): string[];
  clearDevice(): void;
};
