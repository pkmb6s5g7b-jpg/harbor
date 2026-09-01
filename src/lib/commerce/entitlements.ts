import { CORE_TEMPLATE_IDS, ENTITLEMENT_COOKIE, offers } from "../../config/pricing";
import { products } from "../../data/products";

export function expandGrants(grants: string[]): string[] {
  const set = new Set<string>();
  for (const g of grants) {
    if (g === "core-bundle") {
      CORE_TEMPLATE_IDS.forEach((id) => set.add(id));
    } else {
      set.add(g);
      const offer = offers[g];
      if (offer) offer.grants.forEach((id) => set.add(id));
    }
  }
  return [...set];
}

export function hasAccess(owned: string[], sku: string): boolean {
  const expanded = expandGrants(owned);
  if (expanded.includes(sku)) return true;
  if (sku === "core-bundle") {
    return CORE_TEMPLATE_IDS.every((id) => expanded.includes(id));
  }
  return false;
}

export function parseEntitlementCookie(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
  } catch {
    try {
      const parsed = JSON.parse(decodeURIComponent(raw)) as unknown;
      return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
    } catch {
      return raw.split(/[,|]/).map((s) => s.trim()).filter(Boolean);
    }
  }
}

export function serializeEntitlements(skus: string[]): string {
  return JSON.stringify(expandGrants(skus));
}

export const DOWNLOAD_FILES: Record<string, string> = Object.fromEntries(
  products.filter((p) => p.fileName).map((p) => [p.id, p.fileName as string]),
);

export { ENTITLEMENT_COOKIE };
