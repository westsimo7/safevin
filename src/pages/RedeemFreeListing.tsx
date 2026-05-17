import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Gift, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePlan } from "@/hooks/usePlan";
import { toast } from "@/hooks/use-toast";

const RedeemFreeListing = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { refresh } = usePlan();
  const [status, setStatus] = useState<"loading" | "success" | "already" | "error">("loading");
  const ran = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate(`/auth?redirect=${encodeURIComponent("/dashboard/redeem")}`, { replace: true });
      return;
    }
    if (ran.current) return;
    ran.current = true;

    (async () => {
      try {
        const { data, error } = await supabase.rpc("redeem_free_listing");
        if (error) throw error;
        const d = data as { success: boolean; error?: string };
        if (d?.success) {
          setStatus("success");
          await refresh();
          toast({ title: "🎁 Annuncio gratuito attivato", description: "1 credito aggiunto al tuo account." });
          setTimeout(() => navigate("/dashboard", { replace: true }), 1400);
        } else if (d?.error === "already_claimed") {
          setStatus("already");
          toast({ title: "Annuncio gratuito già riscattato", description: "Lo hai già attivato in passato." });
          setTimeout(() => navigate("/dashboard", { replace: true }), 1400);
        } else {
          setStatus("error");
          toast({ title: "Errore", description: d?.error || "Riprova più tardi.", variant: "destructive" });
        }
      } catch (e: any) {
        setStatus("error");
        toast({ title: "Errore", description: e?.message || "Riprova più tardi.", variant: "destructive" });
      }
    })();
  }, [authLoading, user, navigate, refresh]);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background px-6 text-center">
      <div className="max-w-sm">
        {status === "loading" && (
          <>
            <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin text-primary" />
            <h1 className="text-xl font-bold text-foreground mb-1">Stiamo attivando il tuo annuncio gratuito…</h1>
            <p className="text-sm text-muted-foreground">Un secondo.</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h1 className="text-2xl font-bold text-foreground mb-1">Fatto!</h1>
            <p className="text-sm text-muted-foreground">Ti porto alla dashboard…</p>
          </>
        )}
        {status === "already" && (
          <>
            <Gift className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold text-foreground mb-1">Già riscattato</h1>
            <p className="text-sm text-muted-foreground">Ti porto alla dashboard…</p>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-2">Qualcosa è andato storto</h1>
            <button onClick={() => navigate("/dashboard", { replace: true })} className="text-primary underline text-sm">Vai alla dashboard</button>
          </>
        )}
      </div>
    </div>
  );
};

export default RedeemFreeListing;
