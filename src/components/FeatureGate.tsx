import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import { FeatureKey, REQUIRED_PLAN, PLANS } from "@/lib/plans";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FeatureGateProps {
  feature: FeatureKey;
  /** Anche se il piano è ok, controlla che esistano crediti residui per la feature consumabile */
  requireCredits?: boolean;
  /** I children DEVONO ricevere e usare la prop disabled */
  children: (args: { disabled: boolean; reason: string | null }) => ReactNode;
  /** Se true, mostra anche il badge piano sopra il children */
  showBadge?: boolean;
}

const PLAN_BADGE_COLOR: Record<string, string> = {
  free: "bg-muted text-muted-foreground border-border/50",
  starter: "bg-orange-500/15 text-orange-500 border-orange-500/30",
  pro: "bg-primary/15 text-primary border-primary/30",
  expert: "bg-blue-500/15 text-blue-500 border-blue-500/30",
};

export const FeatureGate = ({ feature, requireCredits = false, children, showBadge = true }: FeatureGateProps) => {
  const { state, canAccess, hasCredits, loading } = usePlan();

  if (loading || !state) {
    return <>{children({ disabled: true, reason: "Caricamento…" })}</>;
  }

  const allowed = canAccess(feature);
  const required = REQUIRED_PLAN[feature];
  const requiredLabel = PLANS[required].label;

  let disabled = !allowed;
  let reason: string | null = !allowed ? `Disponibile dal piano ${requiredLabel}` : null;

  if (allowed && requireCredits) {
    const creditFeature = feature === "studio" ? "studio" : feature === "creative_director" ? "creative_director" : null;
    if (creditFeature && !hasCredits(creditFeature)) {
      disabled = true;
      reason = "Crediti esauriti per questo periodo";
    }
  }

  const content = children({ disabled, reason });

  if (!disabled || !showBadge) return <>{content}</>;

  const badgeClass = PLAN_BADGE_COLOR[required] || PLAN_BADGE_COLOR.pro;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative inline-block w-full">
            {content}
            <Badge
              variant="outline"
              className={`absolute -top-2 -right-2 text-[10px] px-1.5 py-0 h-4 gap-1 z-10 pointer-events-none ${badgeClass}`}
            >
              <Lock className="w-2.5 h-2.5" />
              {requiredLabel}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">{reason || `Richiede piano ${requiredLabel}`}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FeatureGate;
