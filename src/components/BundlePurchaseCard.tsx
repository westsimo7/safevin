import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Loader2, Trophy, Star, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { speedupCheckoutHover } from "@/lib/checkoutSpeed";

interface Tier {
  qty: number;
  name: string;
  price: string;
  oldPrice: string;
  icon: typeof Star;
}

const TIERS: Tier[] = [
  { qty: 5, name: "Dilettante", price: "2,95", oldPrice: "3,95", icon: Star },
  { qty: 10, name: "Esperto", price: "5,95", oldPrice: "7,95", icon: Trophy },
  { qty: 15, name: "Campione", price: "9,95", oldPrice: "12,95", icon: Crown },
];

interface Props {
  accentClass?: string;
}

const BundlePurchaseCard = ({}: Props) => {
  const [loadingQty, setLoadingQty] = useState<number | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleCheckout = async (qty: number) => {
    if (!user) {
      navigate(`/auth?bundle=${qty}`);
      return;
    }
    setLoadingQty(qty);
    try {
      const { data, error } = await supabase.functions.invoke("create-bundle-checkout", {
        body: { quantity: qty },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Nessun URL di checkout ricevuto");
      }
    } catch (e: any) {
      toast({
        title: "Errore",
        description: e?.message ?? "Impossibile avviare il pagamento",
        variant: "destructive",
      });
      setLoadingQty(null);
    }
  };

  return (
    <div
      id="bundle"
      data-reveal
      className="relative flex flex-col p-4 sm:p-5 rounded-2xl transition-all duration-300 w-[85vw] sm:w-[45vw] md:w-[42vw] lg:w-auto min-w-0 snap-center flex-shrink-0 lg:flex-shrink border-2 border-primary/60 bg-card shadow-lg shadow-primary/10 scroll-mt-20"
    >
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
        <div className="px-3 py-1 rounded-full bg-primary text-white text-xs font-semibold whitespace-nowrap shadow-lg shadow-primary/30">
          Annunci Singoli
        </div>
      </div>

      <div className="mb-4">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-2 sm:mb-3 bg-primary/20">
          <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold mb-1 text-primary">Annunci Singoli</h3>
        <p className="text-[13px] sm:text-sm text-muted-foreground">
          Scegli il pacchetto più adatto a te. Nessun abbonamento, paghi una volta sola.
        </p>
      </div>

      {/* Tier list - identical layout, fills container */}
      <div className="flex flex-col gap-3 flex-grow">
        {TIERS.map((tier) => {
          const isLoading = loadingQty === tier.qty;
          const Icon = tier.icon;
          const isHighlight = tier.qty === 10;

          const cardCls = isHighlight
            ? "border-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/15 shadow-lg shadow-yellow-400/20"
            : "border-border/60 hover:border-primary/60 bg-background/40 hover:bg-primary/5";
          const iconCls = isHighlight ? "bg-yellow-400/25 text-yellow-400" : "bg-primary/15 text-primary";
          const priceCls = isHighlight ? "text-yellow-400" : "text-primary";
          const ctaCls = isHighlight ? "text-yellow-400" : "text-primary";

          return (
            <button
              key={tier.qty}
              type="button"
              disabled={loadingQty !== null}
              onClick={() => handleCheckout(tier.qty)}
              onMouseEnter={() => speedupCheckoutHover("create-bundle-checkout")}
              onFocus={() => speedupCheckoutHover("create-bundle-checkout")}
              className={`group relative w-full flex-1 min-h-[88px] text-left rounded-xl border-2 ${cardCls} transition-all duration-200 p-4 flex items-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]`}
            >
              <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${iconCls}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-foreground text-[15px]">{tier.name}</span>
                  <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {tier.qty} annunci
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-lg font-bold tabular-nums ${priceCls}`}>
                    €{tier.price}
                  </span>
                  <span className="text-[12px] text-muted-foreground line-through tabular-nums">
                    €{tier.oldPrice}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                {isLoading ? (
                  <Loader2 className={`w-4 h-4 animate-spin ${ctaCls}`} />
                ) : (
                  <span className={`text-xs font-semibold ${ctaCls} opacity-70 group-hover:opacity-100 transition-opacity`}>
                    →
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Pagamento sicuro con Apple Pay, Google Pay o carta
      </p>
    </div>
  );
};

export default BundlePurchaseCard;
