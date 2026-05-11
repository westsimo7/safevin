import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, ShoppingBag, ArrowRight, Tag } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UNIT_PRICE = 0.59;
const BUNDLE_QTY = 10;
const DISCOUNT_PCT = 0.10;

const fmt = (n: number) =>
  n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const FirstListingPopup = ({ open, onOpenChange }: Props) => {
  const navigate = useNavigate();
  const subtotal = BUNDLE_QTY * UNIT_PRICE;
  const total = subtotal * (1 - DISCOUNT_PCT);

  const handleCta = () => {
    onOpenChange(false);
    navigate("/pricing#bundle");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-primary/30 bg-background">
        {/* Hero */}
        <div className="relative px-6 pt-7 pb-5 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-[11px] font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Primo annuncio creato
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground leading-tight font-[Poppins]">
            Hai creato il tuo primo annuncio!
          </DialogTitle>
          <DialogDescription className="text-sm text-foreground/75 mt-2 leading-relaxed">
            Continua a creare qualità per il tuo Vinted da{" "}
            <span className="text-primary font-bold">€0,59</span> ad annuncio.
          </DialogDescription>
        </div>

        {/* Bundle highlight */}
        <div className="px-6 pb-2">
          <div className="rounded-2xl border border-orange-500/40 bg-orange-500/5 p-4">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-foreground">Pacchetto 10 annunci</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500 bg-orange-500/15 px-2 py-0.5 rounded-full">
                -10%
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">€{fmt(total)}</span>
              <span className="text-sm text-muted-foreground line-through">€{fmt(subtotal)}</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Solo €{fmt(total / BUNDLE_QTY)} ad annuncio • paghi una volta sola
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 pb-6 pt-3 space-y-2">
          <Button
            onClick={handleCta}
            variant="neon"
            size="lg"
            className="w-full h-12 text-base"
          >
            <ShoppingBag className="w-5 h-5" />
            Acquista annunci
            <ArrowRight className="w-4 h-4" />
          </Button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            Più tardi
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FirstListingPopup;
