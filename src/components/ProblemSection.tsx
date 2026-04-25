import { AlertTriangle, MessageSquare, RefreshCw, Clock, Users, Smartphone, Copy, Send } from "lucide-react";
import { useScrollReveal, useStaggerReveal } from "@/hooks/useScrollReveal";
import { useTranslation } from "react-i18next";

const problemKeys = [
  { icon: Copy, key: "photos" },
  { icon: RefreshCw, key: "title" },
  { icon: MessageSquare, key: "description" },
  { icon: Users, key: "details" },
  { icon: Clock, key: "price" },
  { icon: Send, key: "value" },
] as const;

const ProblemSection = () => {
  const headerRef = useScrollReveal({ direction: "left", duration: 0.7 });
  const gridRef = useStaggerReveal({ direction: "up", stagger: 0.08, distance: 30 });
  const closingRef = useScrollReveal({ direction: "up", delay: 0.2, duration: 0.8 });
  const { t } = useTranslation();

  return (
    <section className="relative py-14 sm:py-20 md:py-24 bg-card/30 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-5 sm:px-6 max-w-4xl">
        <div ref={headerRef} className="flex items-start sm:items-center gap-3 mb-6 sm:mb-8">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">
            {t("problem.title")}
          </h2>
        </div>

        <div ref={gridRef} className="grid sm:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 mb-8 sm:mb-10">
          {problemKeys.map((problem, index) => (
            <div
              key={index}
              data-reveal
              className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl bg-background/50 border border-border/50 hover:border-destructive/30 transition-colors"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-destructive/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                <problem.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-destructive/70" />
              </div>
              <span className="text-foreground/80 text-[13px] sm:text-sm leading-relaxed">
                {t(`problem.items.${problem.key}`)}
              </span>
            </div>
          ))}
        </div>

        <div ref={closingRef} className="p-4 sm:p-6 rounded-2xl bg-background border border-border">
          <p className="text-base sm:text-lg text-foreground font-medium text-center">
            {t("problem.closing")} <span className="text-destructive">{t("problem.closingHighlight")}</span>
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
};

export default ProblemSection;
