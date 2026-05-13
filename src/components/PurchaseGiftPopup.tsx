import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePlan } from "@/hooks/usePlan";
import { toast } from "@/hooks/use-toast";

const PurchaseGiftPopup = () => {
  const { user } = useAuth();
  const { refresh: refreshPlan } = usePlan();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const dismissKey = `purchaseGiftDismissed:${user.id}`;
    (async () => {
      try {
        const { data, error } = await supabase.rpc("get_purchase_gift_status");
        if (error) return;
        const d = data as { eligible?: boolean; claimed?: boolean };
        if (d?.eligible && !d?.claimed && !localStorage.getItem(dismissKey)) {
          setOpen(true);
        }
      } catch {}
    })();
  }, [user?.id]);

  const handleClaim = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("claim_purchase_gift");
      if (error) throw error;
      const d = data as { success?: boolean; error?: string };
      if (d?.success) {
        setClaimed(true);
        await refreshPlan();
        toast({ title: "Regalo riscosso!", description: "Hai ricevuto 1 annuncio bonus." });
      } else {
        toast({ title: "Non disponibile", description: d?.error || "Riprova più tardi.", variant: "destructive" });
        setOpen(false);
      }
    } catch (e: any) {
      toast({ title: "Errore", description: e.message || "Riprova", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (next: boolean) => {
    if (!next && user?.id && !claimed) {
      localStorage.setItem(`purchaseGiftDismissed:${user.id}`, "1");
    }
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-orange-500/40 bg-background">
        <div className="relative px-6 pt-7 pb-5 bg-gradient-to-br from-orange-500/20 via-orange-500/10 to-transparent">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-500 text-[11px] font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Regalo per te
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground leading-tight font-[Poppins]">
            Grazie per il tuo acquisto!
          </DialogTitle>
          <DialogDescription className="text-sm text-foreground/75 mt-2 leading-relaxed">
            Per ringraziarti ti regaliamo{" "}
            <span className="text-orange-500 font-bold">1 annuncio extra</span>. Riscuotilo ora.
          </DialogDescription>
        </div>

        <div className="px-6 pb-2">
          <div className="rounded-2xl border border-orange-500/40 bg-orange-500/5 p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
              <Gift className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">+1 annuncio bonus</p>
              <p className="text-[11px] text-muted-foreground">Si aggiunge ai tuoi crediti immediatamente</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-3 space-y-2">
          <Button
            onClick={claimed ? () => setOpen(false) : handleClaim}
            disabled={loading}
            variant="neon"
            size="lg"
            className="w-full h-12 text-base"
          >
            {claimed ? (
              <>
                <Check className="w-5 h-5" />
                Riscosso
              </>
            ) : (
              <>
                <Gift className="w-5 h-5" />
                {loading ? "Riscatto..." : "Riscuoti regalo"}
              </>
            )}
          </Button>
          {!claimed && (
            <button
              type="button"
              onClick={() => handleClose(false)}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              Più tardi
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseGiftPopup;
