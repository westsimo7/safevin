import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Crown, Loader2, Star, Trophy, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Tier {
  qty: number;
  price: string;
  oldPrice: string;
  icon: typeof Star;
  highlight?: boolean;
}

const TIERS: Tier[] = [
  { qty: 5, price: "2,95", oldPrice: "3,95", icon: Star },
  { qty: 10, price: "4,95", oldPrice: "7,95", icon: Trophy, highlight: true },
  { qty: 15, price: "8,95", oldPrice: "12,95", icon: Crown },
];

const PurchaseOptionsPopup = ({ open, onOpenChange }: Props) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const buyBundle = async (qty: number) => {
    if (!user) { navigate(`/auth?bundle=${qty}`); return; }
    setLoadingKey(`bundle-${qty}`);
    try {
      const { data, error } = await supabase.functions.invoke("create-bundle-checkout", { body: { quantity: qty } });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
      else throw new Error("Checkout non disponibile");
    } catch (e: any) {
      toast({ title: "Errore", description: e?.message ?? "Impossibile avviare il pagamento", variant: "destructive" });
      setLoadingKey(null);
    }
  };

  const buyPro = async () => {
    if (!user) { navigate("/auth?plan=pro"); return; }
    setLoadingKey("pro");
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", { body: { plan: "pro" } });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
      else throw new Error("Checkout non disponibile");
    } catch (e: any) {
      toast({ title: "Errore", description: e?.message ?? "Impossibile avviare il pagamento", variant: "destructive" });
      setLoadingKey(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-primary/30 bg-background max-h-[90dvh] overflow-y-auto">
        <div className="relative px-6 pt-7 pb-4 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-500 text-[11px] font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Offerta lancio
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground leading-tight font-[Poppins]">
            Continua a vendere meglio
          </DialogTitle>
          <DialogDescription className="text-sm text-foreground/75 mt-2 leading-relaxed">
            Scegli un pacchetto di annunci singoli oppure passa al Pro.
          </DialogDescription>
        </div>

        {/* Bundles */}
        <div className="px-6 pb-2 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Annunci singoli</p>
          {TIERS.map((t) => {
            const Icon = t.icon;
            const isLoading = loadingKey === `bundle-${t.qty}`;
            const highlight = t.highlight;
            return (
              <button
                key={t.qty}
                type="button"
                disabled={loadingKey !== null}
                onClick={() => buyBundle(t.qty)}
                className={`w-full rounded-xl border-2 transition-all p-3 flex items-center gap-3 disabled:opacity-60 active:scale-[0.99] ${
                  highlight
                    ? "border-orange-500 bg-orange-500/5"
                    : "border-border/60 hover:border-primary/50 bg-background"
                }`}
              >
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${highlight ? "bg-orange-500/15 text-orange-500" : "bg-primary/10 text-primary"}`}>
                  <span className="text-lg font-black tabular-nums leading-none">{t.qty}</span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-foreground text-sm">ANNUNCI</span>
                    {highlight && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-orange-500">
                        il più scelto ⭐
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className={`text-base font-bold tabular-nums ${highlight ? "text-orange-500" : "text-primary"}`}>
                      €{t.price}
                    </span>
                    <span className="text-[11px] text-muted-foreground line-through tabular-nums">
                      €{t.oldPrice}
                    </span>
                  </div>
                </div>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <span className="text-primary text-sm">→</span>}
              </button>
            );
          })}
        </div>

        {/* Pro */}
        <div className="px-6 pb-2 mt-3 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Abbonamento</p>
          <button
            type="button"
            disabled={loadingKey !== null}
            onClick={buyPro}
            className="w-full rounded-xl border-2 border-primary bg-primary/5 transition-all p-3 flex items-center gap-3 disabled:opacity-60 active:scale-[0.99]"
          >
            <div className="w-11 h-11 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-foreground text-sm">PRO</span>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">25 annunci/mese</span>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-base font-bold tabular-nums text-primary">€12,99</span>
                <span className="text-[11px] text-muted-foreground">/mese</span>
                <span className="text-[11px] text-muted-foreground line-through tabular-nums">€15,99</span>
              </div>
            </div>
            {loadingKey === "pro" ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <span className="text-primary text-sm">→</span>}
          </button>
        </div>

        <div className="px-6 pb-6 pt-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full h-10 text-muted-foreground"
          >
            Più tardi
          </Button>
          <p className="mt-1 text-center text-[10px] text-muted-foreground">
            Pagamento sicuro con Apple Pay, Google Pay o carta
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseOptionsPopup;
