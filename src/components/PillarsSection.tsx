import { useState } from "react";
import { Camera, Lightbulb, Palette, CheckCircle2, ChevronRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useScrollReveal, useStaggerReveal } from "@/hooks/useScrollReveal";
import { useIsMobile } from "@/hooks/use-mobile";

const pillars = [
  {
    key: "qualita",
    label: "Qualità",
    icon: Camera,
    short: "Nitidezza e definizione",
    body:
      "Valutiamo la nitidezza e la definizione di ogni foto. Immagini sgranate o sfocate riducono drasticamente la fiducia dell'acquirente. Per ottenere il massimo punteggio scatta con luce naturale, fotocamera stabile e messa a fuoco sull'indumento.",
  },
  {
    key: "luce",
    label: "Luce",
    icon: Lightbulb,
    short: "Illuminazione corretta",
    body:
      "Analizziamo come la luce colpisce l'indumento: controluce, ombre forti o sotto-esposizione nascondono dettagli importanti. La luce frontale e naturale (es. davanti a una finestra) è sempre la scelta migliore per mostrare colore reale e dettagli.",
  },
  {
    key: "contrasto",
    label: "Contrasto",
    icon: Palette,
    short: "Stacco dal fondo",
    body:
      "Il capo deve risaltare dallo sfondo. Un contrasto efficace rende il prodotto leggibile e protagonista dell'immagine. Usa uno sfondo opposto al colore del capo (chiaro per capi scuri, scuro per capi chiari) per farlo emergere.",
  },
  {
    key: "completezza",
    label: "Completezza",
    icon: CheckCircle2,
    short: "Tutti gli angoli coperti",
    body:
      "Verifichiamo che il set foto copra tutti gli angoli necessari: fronte, retro, dettagli, etichette ed eventuali difetti. Un set completo elimina i dubbi dell'acquirente e accelera la decisione di acquisto.",
  },
];

const PillarsSection = () => {
  const headerRef = useScrollReveal({ direction: "up", duration: 0.7 });
  const gridRef = useStaggerReveal({ direction: "up", stagger: 0.08, distance: 30 });
  const isMobile = useIsMobile();
  const [openKey, setOpenKey] = useState<string | null>(null);

  const active = pillars.find((p) => p.key === openKey) ?? null;

  return (
    <section className="relative py-14 sm:py-20 md:py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-5 sm:px-6 max-w-5xl">
        <div ref={headerRef} className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-foreground mb-2.5 sm:mb-3 md:mb-4">
            I 4 pilastri dell'<span className="text-primary">analisi foto</span>
          </h2>
          <p className="text-muted-foreground text-[13px] sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
            Ogni immagine viene valutata su 4 parametri chiave per massimizzare la probabilità di vendita.
          </p>
        </div>

        {/* Mobile: 2x2 compact tiles */}
        <div ref={gridRef} className="grid grid-cols-2 gap-2.5 sm:hidden">
          {pillars.map((p) => (
            <button
              key={p.key}
              data-reveal
              onClick={() => setOpenKey(p.key)}
              className="text-left p-4 rounded-2xl bg-card/60 border border-border/50 hover:border-primary/40 active:scale-[0.98] transition-all flex flex-col gap-3 min-h-[140px]"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <p.icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground leading-tight">{p.label}</h3>
                <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{p.short}</p>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-primary font-medium">
                schiaccia per leggere
                <ChevronRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>

        {/* Desktop / Tablet: full open cards */}
        <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {pillars.map((p) => (
            <div
              key={p.key}
              className="p-5 md:p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 transition-colors flex flex-col h-full"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <p.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">{p.label}</h3>
              <p className="text-[13px] md:text-sm text-muted-foreground leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Full-screen dialog (mobile) */}
      <Dialog open={!!openKey && isMobile} onOpenChange={(o) => !o && setOpenKey(null)}>
        <DialogContent className="max-w-none w-screen h-[100dvh] sm:h-auto p-0 rounded-none border-0 bg-background flex flex-col gap-0 [&>button]:hidden">
          {active && (
            <>
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <active.icon className="w-5 h-5 text-primary" />
                  </div>
                  <DialogTitle className="text-lg font-semibold text-foreground">
                    {active.label}
                  </DialogTitle>
                </div>
                <button
                  onClick={() => setOpenKey(null)}
                  className="w-9 h-9 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center"
                  aria-label="Chiudi"
                >
                  <X className="w-4 h-4 text-foreground" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
                <DialogDescription className="text-sm text-primary font-medium">
                  {active.short}
                </DialogDescription>
                <p className="text-[15px] text-foreground/90 leading-relaxed">{active.body}</p>
              </div>
              <div className="px-5 py-4 border-t border-border/50">
                <button
                  onClick={() => setOpenKey(null)}
                  className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
                >
                  Chiudi
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default PillarsSection;
