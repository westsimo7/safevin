import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePlan } from "@/hooks/usePlan";
import { FeatureKey } from "@/lib/plans";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

interface PlanProtectedRouteProps {
  children: React.ReactNode;
  feature: FeatureKey;
}

const PlanProtectedRoute = ({ children, feature }: PlanProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { state, loading: planLoading, canAccess } = usePlan();
  const location = useLocation();
  const toastShownRef = useRef(false);

  const isLoading = authLoading || planLoading;
  const allowed = !isLoading && !!state && canAccess(feature);

  useEffect(() => {
    if (!isLoading && user && state && !allowed && !toastShownRef.current) {
      toastShownRef.current = true;
      toast.error("Accesso non disponibile con il tuo piano attuale");
    }
  }, [isLoading, user, state, allowed]);

  if (isLoading) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!allowed) {
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
};

export default PlanProtectedRoute;
