import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  PLANS,
  PlanId,
  FeatureKey,
  PlanLimits,
  REQUIRED_PLAN,
  isPlanAtLeast,
} from "@/lib/plans";

interface PlanState {
  plan: PlanId;
  limits: PlanLimits;
  studioUsed: number;
  studioLimit: number;
  studioRemaining: number;
  cdUsed: number;
  cdLimit: number;
  cdRemaining: number;
  periodStart: string | null;
  periodEnd: string | null;
  isFounder: boolean;
}

interface PlanContextValue {
  loading: boolean;
  state: PlanState | null;
  refresh: () => Promise<void>;
  /** Verifica accesso a una feature (gate visivo). Founder = sempre true */
  canAccess: (feature: FeatureKey) => boolean;
  /** Verifica se ci sono crediti residui per una feature consumabile */
  hasCredits: (feature: "studio" | "creative_director") => boolean;
  /** Consuma 1 credito server-side. Restituisce true se andato a buon fine */
  consume: (feature: "studio" | "creative_director") => Promise<{
    success: boolean;
    error?: string;
  }>;
}

const DEFAULT_STATE: PlanState = {
  plan: "free",
  limits: PLANS.free.limits,
  studioUsed: 0,
  studioLimit: PLANS.free.limits.studio_limit,
  studioRemaining: PLANS.free.limits.studio_limit,
  cdUsed: 0,
  cdLimit: 0,
  cdRemaining: 0,
  periodStart: null,
  periodEnd: null,
  isFounder: false,
};

const PlanContext = createContext<PlanContextValue | null>(null);

export const PlanProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [state, setState] = useState<PlanState | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setState(null);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase.rpc("get_user_plan");
      if (error) throw error;
      const d = data as any;
      if (!d || d.error) {
        setState(null);
      } else {
        const planId = (d.plan as PlanId) || "free";
        const plan = PLANS[planId] || PLANS.free;
        setState({
          plan: planId,
          limits: (d.limits as PlanLimits) || plan.limits,
          studioUsed: d.studio_used ?? 0,
          studioLimit: d.studio_limit ?? plan.limits.studio_limit,
          studioRemaining: d.studio_remaining ?? plan.limits.studio_limit,
          cdUsed: d.creative_director_used ?? 0,
          cdLimit: d.creative_director_limit ?? plan.limits.creative_director_limit,
          cdRemaining: d.creative_director_remaining ?? plan.limits.creative_director_limit,
          periodStart: d.current_period_start ?? null,
          periodEnd: d.current_period_end ?? null,
          isFounder: !!d.is_founder,
        });
      }
    } catch (err) {
      console.error("usePlan: failed to load plan", err);
      setState(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    refresh();
  }, [refresh]);

  const canAccess = useCallback(
    (feature: FeatureKey): boolean => {
      if (!state) return false;
      if (state.isFounder) return true;
      const required = REQUIRED_PLAN[feature];
      return isPlanAtLeast(state.plan, required);
    },
    [state]
  );

  const hasCredits = useCallback(
    (feature: "studio" | "creative_director"): boolean => {
      if (!state) return false;
      if (state.isFounder) return true;
      if (feature === "studio") return state.studioRemaining > 0;
      if (feature === "creative_director") return state.cdRemaining > 0;
      return false;
    },
    [state]
  );

  const consume = useCallback(
    async (feature: "studio" | "creative_director") => {
      try {
        const { data, error } = await supabase.rpc("consume_feature_credit", { p_feature: feature });
        if (error) throw error;
        const d = data as any;
        if (d?.success) {
          await refresh();
          return { success: true };
        }
        return { success: false, error: d?.error || "unknown" };
      } catch (err: any) {
        return { success: false, error: err.message || "rpc_failed" };
      }
    },
    [refresh]
  );

  return (
    <PlanContext.Provider value={{ loading, state: state || DEFAULT_STATE, refresh, canAccess, hasCredits, consume }}>
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
};
