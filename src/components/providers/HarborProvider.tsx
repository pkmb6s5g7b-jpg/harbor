"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { type Offer } from "../../config/pricing";
import type { ToolSlug } from "../../data/tools";
import { resolveOffer } from "../../lib/commerce/resolve-offer";
import { expandGrants, hasAccess } from "../../lib/commerce/entitlements";
import { localStorageAdapter } from "../../lib/storage/local";
import type { Plan } from "../../lib/storage/types";
import { EmailCapture } from "../monetization/EmailCapture";
import { MockCheckout } from "../monetization/MockCheckout";

type EmailCtx = { tool: string; summary: string };

type HarborContextValue = {
  isPro: boolean;
  purchases: string[];
  hasTemplate: (id: string) => boolean;
  setPro: (v: boolean) => void;
  openCheckout: (offerId?: string) => void;
  openEmail: (ctx: EmailCtx) => void;
  listPlans: (tool?: ToolSlug) => Plan[];
  savePlan: (plan: Plan) => { ok: true } | { ok: false; reason: "pro-required" };
  deletePlan: (id: string) => void;
  refresh: () => void;
};

const HarborContext = createContext<HarborContextValue | null>(null);
const EMPTY_PURCHASES: string[] = [];

const PRO_EVENT = "harbor-pro";
const BUY_EVENT = "harbor-buy";

function subscribeEntitlements(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", cb);
  window.addEventListener(PRO_EVENT, cb);
  window.addEventListener(BUY_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(PRO_EVENT, cb);
    window.removeEventListener(BUY_EVENT, cb);
  };
}

function getProSnapshot() {
  return localStorageAdapter.getPro();
}

function getPurchasesSnapshot() {
  return localStorageAdapter.getPurchases();
}

export function HarborProvider({ children }: { children: ReactNode }) {
  const isPro = useSyncExternalStore(subscribeEntitlements, getProSnapshot, () => false);
  const purchases = useSyncExternalStore(
    subscribeEntitlements,
    getPurchasesSnapshot,
    () => EMPTY_PURCHASES,
  );
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailCtx, setEmailCtx] = useState<EmailCtx | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const setPro = useCallback((v: boolean) => {
    localStorageAdapter.setPro(v);
    window.dispatchEvent(new Event(PRO_EVENT));
  }, []);

  const value = useMemo<HarborContextValue>(
    () => ({
      isPro,
      purchases,
      hasTemplate: (id: string) => hasAccess(purchases, id),
      setPro,
      openCheckout: (offerId = "pro") => {
        setOffer(resolveOffer(offerId) ?? null);
        setCheckoutOpen(true);
      },
      openEmail: (ctx) => {
        setEmailCtx(ctx);
        setEmailOpen(true);
      },
      listPlans: (tool) => {
        void tick;
        return localStorageAdapter.listPlans(tool);
      },
      savePlan: (plan) => {
        const result = localStorageAdapter.savePlan(plan);
        refresh();
        return result;
      },
      deletePlan: (id) => {
        localStorageAdapter.deletePlan(id);
        refresh();
      },
      refresh,
    }),
    [isPro, purchases, setPro, tick, refresh],
  );

  return (
    <HarborContext.Provider value={value}>
      {children}
      <MockCheckout
        open={checkoutOpen}
        offer={offer}
        onClose={() => setCheckoutOpen(false)}
        onPaid={async (grants, email, name) => {
          const expanded = expandGrants(grants);
          if (expanded.includes("pro")) setPro(true);
          localStorageAdapter.addPurchases(expanded);
          if (email) localStorageAdapter.addEmail(email, name);
          window.dispatchEvent(new Event(BUY_EVENT));
          await fetch("/api/entitlements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ skus: expanded, email }),
          });
        }}
      />
      <EmailCapture
        open={emailOpen}
        tool={emailCtx?.tool ?? ""}
        summary={emailCtx?.summary ?? ""}
        onClose={() => setEmailOpen(false)}
        onSubmit={async (email, name) => {
          localStorageAdapter.addEmail(email, name);
          const res = await fetch("/api/email/results", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              name,
              tool: emailCtx?.tool ?? "",
              summary: emailCtx?.summary ?? "",
            }),
          });
          const raw = await res.text();
          let data: { error?: string } = {};
          try {
            data = raw ? (JSON.parse(raw) as { error?: string }) : {};
          } catch {
            data = { error: "Could not send that email." };
          }
          if (!res.ok) {
            throw new Error(data.error ?? "Could not send that email.");
          }
        }}
      />
    </HarborContext.Provider>
  );
}

export function useHarbor() {
  const ctx = useContext(HarborContext);
  if (!ctx) throw new Error("useHarbor must be used within HarborProvider");
  return ctx;
}
