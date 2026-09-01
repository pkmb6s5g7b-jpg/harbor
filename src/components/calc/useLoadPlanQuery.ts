"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import type { ToolSlug } from "../../data/tools";
import type { Plan } from "../../lib/storage/types";
import { useHarbor } from "../providers/HarborProvider";

export function useLoadPlanQuery(tool: ToolSlug, onLoad: (plan: Plan) => void) {
  const params = useSearchParams();
  const planId = params.get("plan");
  const { listPlans } = useHarbor();
  const loaded = useRef<string | null>(null);

  useEffect(() => {
    if (!planId || loaded.current === planId) return;
    const plan = listPlans(tool).find((p) => p.id === planId);
    if (!plan) return;
    loaded.current = planId;
    onLoad(plan);
  }, [planId, tool, listPlans, onLoad]);
}
