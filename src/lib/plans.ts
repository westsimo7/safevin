// Single source of truth per piani, limiti e feature.
// Deve restare allineato a public.get_plan_limits() in DB.

export type PlanId = "free" | "starter" | "pro" | "expert";

export type FeatureKey =
  | "studio"
  | "incomplete_save"
  | "support_24h"
  | "creative_director"
  | "upgrade"
  | "collaboration";

export interface PlanLimits {
  studio_limit: number;
  creative_director_limit: number;
  history_mode: "last_2" | "last_3_sessions" | "monthly" | "quarterly";
  incomplete_save: boolean;
  support_24h: boolean;
  creative_director_access: boolean;
  upgrade_access: boolean;
  collaboration_access: boolean;
}

export interface PlanDefinition {
  id: PlanId;
  label: string;
  price: string;
  limits: PlanLimits;
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: "free",
    label: "Starter",
    price: "0",
    limits: {
      studio_limit: 2,
      creative_director_limit: 0,
      history_mode: "last_2",
      incomplete_save: false,
      support_24h: false,
      creative_director_access: false,
      upgrade_access: false,
      collaboration_access: false,
    },
  },
  starter: {
    id: "starter",
    label: "Starter",
    price: "5,99",
    limits: {
      studio_limit: 10,
      creative_director_limit: 0,
      history_mode: "last_3_sessions",
      incomplete_save: true,
      support_24h: true,
      creative_director_access: false,
      upgrade_access: false,
      collaboration_access: false,
    },
  },
  pro: {
    id: "pro",
    label: "Pro",
    price: "12,99",
    limits: {
      studio_limit: 25,
      creative_director_limit: 2,
      history_mode: "monthly",
      incomplete_save: true,
      support_24h: true,
      creative_director_access: true,
      upgrade_access: false,
      collaboration_access: false,
    },
  },
  expert: {
    id: "expert",
    label: "Expert",
    price: "34,99",
    limits: {
      studio_limit: 60,
      creative_director_limit: 6,
      history_mode: "quarterly",
      incomplete_save: true,
      support_24h: true,
      creative_director_access: true,
      upgrade_access: true,
      collaboration_access: true,
    },
  },
};

// Restituisce il piano minimo richiesto per ogni feature (usato per mostrare badge).
export const REQUIRED_PLAN: Record<FeatureKey, PlanId> = {
  studio: "free",
  incomplete_save: "starter",
  support_24h: "starter",
  creative_director: "pro",
  upgrade: "expert",
  collaboration: "expert",
};

export const PLAN_ORDER: PlanId[] = ["free", "starter", "pro", "expert"];

export function isPlanAtLeast(current: PlanId, required: PlanId): boolean {
  return PLAN_ORDER.indexOf(current) >= PLAN_ORDER.indexOf(required);
}

// Limiti per la storia (usato in Storico)
export function getHistoryLimit(mode: PlanLimits["history_mode"]): {
  type: "count" | "days";
  value: number;
} {
  switch (mode) {
    case "last_2":
      return { type: "count", value: 2 };
    case "last_3_sessions":
      return { type: "count", value: 3 };
    case "monthly":
      return { type: "days", value: 30 };
    case "quarterly":
      return { type: "days", value: 90 };
  }
}
