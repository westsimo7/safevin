import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingBag, Loader2, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ApplePayButton from "@/components/ApplePayButton";
import { speedupCheckoutHover } from "@/lib/checkoutSpeed";

const UNIT_PRICE = 0.59;
const getDiscountPct = (q: number) => (q >= 60 ? 0.20 : q >= 30 ? 0.15 : q >= 10 ? 0.10 : 0);

interface Props {
  accentClass?: string;
}

const BundlePurchaseCard = ({ accentClass }: Props) => {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const subtotal = qty * UNIT_PRICE;
  const discountPct = getDiscountPct(qty);
  const hasDiscount = discountPct > 0;
  const total = subtotal * (1 - discountPct);

  const fmt = (n: number) =>
    n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => Math.min(500, q + 1));

  const handleCheckout = async () => {
    if (!user) {
      navigate(`/auth?bundle=${qty}`);
      return;
    }
    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <div
      id="bundle"
      data-reveal
      className="relative flex flex-col p-4 sm:p-5 rounded-2xl transition-all duration-300 w-[85vw] sm:w-[45vw] md:w-[42vw] lg:w-auto min-w-0 snap-center flex-shrink-0 lg:flex-shrink border-2 border-orange-500/60 bg-card shadow-lg shadow-orange-500/10 scroll-mt-20"
    >
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
        <div className="px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-semibold whitespace-nowrap shadow-lg shadow-orange-500/30">
          Acquisto singolo
        </div>
      </div>

      <div className="mb-3 sm:mb-4">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-2 sm:mb-3 bg-orange-500/20">
          <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold mb-1 text-orange-500">Annunci Singoli</h3>
        <p className="text-[13px] sm:text-sm text-muted-foreground">
          Compra solo gli annunci che ti servono. Nessun abbonamento. Sconto 10% da 10 annunci.
        </p>
      </div>

      <div className="mb-3 sm:mb-4 flex items-baseline gap-2 flex-wrap">
        <span className="text-2xl sm:text-3xl font-bold text-foreground">€0,59</span>
        <span className="text-muted-foreground text-[13px] sm:text-sm">/annuncio</span>
      </div>

      {/* Quantity selector */}
      <div className="mb-3 rounded-xl bg-background/50 border border-border/50 p-3">
        <div className="text-[12px] uppercase tracking-wide text-muted-foreground mb-2 text-center">
          Quantità annunci
        </div>
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={dec}
            disabled={qty <= 1}
            aria-label="Diminuisci"
            className="h-11 w-11 rounded-full bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 disabled:opacity-40 disabled:hover:bg-orange-500/10 flex items-center justify-center transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="flex-1 text-center">
            <div className="text-3xl sm:text-4xl font-bold text-foreground tabular-nums leading-none">
              {qty}
            </div>
          </div>
          <button
            type="button"
            onClick={inc}
            disabled={qty >= 500}
            aria-label="Aumenta"
            className="h-11 w-11 rounded-full bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 disabled:opacity-40 flex items-center justify-center transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Discount quick-set pills */}
        <div className="mt-3 flex items-center justify-center gap-2">
          {[
            { pct: 10, q: 10 },
            { pct: 15, q: 30 },
            { pct: 20, q: 60 },
          ].map(({ pct, q }) => {
            const active = qty >= q && (q === 60 || qty < (q === 10 ? 30 : 60));
            return (
              <button
                key={pct}
                type="button"
                onClick={() => setQty(q)}
                className={`px-3 h-8 rounded-full text-[12px] font-bold transition-all border ${
                  active
                    ? "bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/30"
                    : "bg-orange-500/10 text-orange-500 border-orange-500/30 hover:bg-orange-500/20"
                }`}
              >
                -{pct}%
              </button>
            );
          })}
        </div>

        {/* Total */}
        <div className="mt-3 pt-3 border-t border-border/50 text-center">
          {hasDiscount ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-sm text-muted-foreground line-through">€{fmt(subtotal)}</span>
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500">
                  -{Math.round(discountPct * 100)}%
                </span>
              </div>
              <div className="text-2xl font-bold text-foreground">€{fmt(total)}</div>
            </>
          ) : (
            <div className="text-2xl font-bold text-foreground">€{fmt(total)}</div>
          )}
        </div>
      </div>

      <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-5 flex-grow">
        {[
          "Paghi solo quello che usi",
          "Nessun rinnovo automatico",
          "Include tutto lo Starter: 1 annuncio prova, prezzo strategico, Assistente Tommy Scendi",
        ].map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-orange-500/10">
              <Check className="w-2.5 h-2.5 text-orange-500" />
            </div>
            <span className="text-foreground/80 text-[12.5px] sm:text-[13px] leading-snug">{f}</span>
          </li>
        ))}
      </ul>

      <div className="space-y-2">
        <Button
          className="w-full h-10 sm:h-11 text-sm bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-500/40 shadow-[0_0_20px_rgb(16_185_129_/_0.35)] hover:shadow-[0_0_28px_rgb(16_185_129_/_0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
          disabled={loading}
          onClick={handleCheckout}
          onMouseEnter={() => speedupCheckoutHover("create-bundle-checkout")}
          onFocus={() => speedupCheckoutHover("create-bundle-checkout")}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Acquista ${qty} ${qty === 1 ? "annuncio" : "annunci"}`}
        </Button>
        <ApplePayButton
          onClick={handleCheckout}
          loading={loading}
          prewarmFn="create-bundle-checkout"
        />
      </div>
    </div>
  );
};

export default BundlePurchaseCard;
