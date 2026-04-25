import { useState } from "react";
import { Camera, Lightbulb, Palette, CheckCircle2, ChevronRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useScrollReveal, useStaggerReveal } from "@/hooks/useScrollReveal";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";

const pillarKeys = [
  { key: "qualita", icon: Camera },
  { key: "luce", icon: Lightbulb },
  { key: "contrasto", icon: Palette },
  { key: "completezza", icon: CheckCircle2 },
] as const;

const PillarsSection = () => {
  const headerRef = useScrollReveal({ direction: "up", duration: 0.7 });
  const gridRef = useStaggerReveal({ direction: "up", stagger: 0.08, distance: 30 });
  const isMobile = useIsMobile();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const { t } = useTranslation();

  const active = pillarKeys.find((p) => p.key === openKey) ?? null;

  return (
    <section className="relative py-14 sm:py-20 md:py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-5 sm:px-6 max-w-5xl">
        <div ref={headerRef} className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-foreground mb-2.5 sm:mb-3 md:mb-4">
            {t("pillars.titlePrefix")}<span className="text-primary">{t("pillars.titleHighlight")}</span>
          </h2>
          <p className="text-muted-foreground text-[13px] sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
            {t("pillars.subtitle")}
          </p>
        </div>

        {/* Mobile: 2x2 compact tiles */}
        <div ref={gridRef} className="grid grid-cols-2 gap-2.5 sm:hidden">
          {pillarKeys.map((p) => (
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
                <h3 className="text-sm font-semibold text-foreground leading-tight">{t(`pillars.items.${p.key}.label`)}</h3>
                <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{t(`pillars.items.${p.key}.short`)}</p>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-primary font-medium">
                {t("pillars.tapToRead")}
                <ChevronRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>

        {/* Desktop / Tablet */}
        <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {pillarKeys.map((p) => (
            <div
              key={p.key}
              className="p-5 md:p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 transition-colors flex flex-col h-full"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <p.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">{t(`pillars.items.${p.key}.label`)}</h3>
              <p className="text-[13px] md:text-sm text-muted-foreground leading-relaxed">{t(`pillars.items.${p.key}.body`)}</p>
            </div>
          ))}
        </div>
      </div>

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
                    {t(`pillars.items.${active.key}.label`)}
                  </DialogTitle>
                </div>
                <button
                  onClick={() => setOpenKey(null)}
                  className="w-9 h-9 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center"
                  aria-label={t("pillars.close")}
                >
                  <X className="w-4 h-4 text-foreground" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
                <DialogDescription className="text-sm text-primary font-medium">
                  {t(`pillars.items.${active.key}.short`)}
                </DialogDescription>
                <p className="text-[15px] text-foreground/90 leading-relaxed">{t(`pillars.items.${active.key}.body`)}</p>
              </div>
              <div className="px-5 py-4 border-t border-border/50">
                <button
                  onClick={() => setOpenKey(null)}
                  className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
                >
                  {t("pillars.close")}
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
