import { Upload, PenTool, FileText, Copy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useScrollReveal, useStaggerReveal } from "@/hooks/useScrollReveal";
import { useTranslation } from "react-i18next";

const stepDefs = [
  { icon: Upload, number: "01", key: "upload" },
  { icon: PenTool, number: "02", key: "info" },
  { icon: Copy, number: "03", key: "copy" },
] as const;

const HowItWorksSection = () => {
  const stepsHeaderRef = useScrollReveal({ direction: "up", duration: 0.7 });
  const stepsGridRef = useStaggerReveal({ direction: "up", stagger: 0.15, distance: 50 });
  const blocksHeaderRef = useScrollReveal({ direction: "up", duration: 0.7 });
  const blockRef = useScrollReveal({ direction: "up", delay: 0.1, duration: 0.8 });
  const { t } = useTranslation();

  const features = t("how.features", { returnObjects: true }) as string[];

  return (
    <section className="relative py-14 sm:py-16 md:py-20 bg-card/20 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-5 sm:px-6 max-w-5xl">
        <div ref={stepsHeaderRef} className="text-center mb-8 sm:mb-10 md:mb-14">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2.5 sm:mb-4">
            {t("how.title")}
          </h2>
          <p className="text-muted-foreground text-[13px] sm:text-sm md:text-base">{t("how.subtitle")}</p>
        </div>

        <div ref={stepsGridRef} className="grid sm:grid-cols-3 gap-6 sm:gap-6 md:gap-8 mb-14 sm:mb-16 md:mb-20">
          {stepDefs.map((step, index) => (
            <div key={index} data-reveal className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 sm:mb-5">
                <step.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-primary/60 tracking-widest uppercase">{step.number}</span>
              <h3 className="text-base sm:text-lg font-bold text-foreground mt-1 mb-1.5 sm:mb-2">{t(`how.steps.${step.key}.title`)}</h3>
              <p className="text-[13px] sm:text-sm text-muted-foreground leading-relaxed max-w-[260px] mx-auto">{t(`how.steps.${step.key}.description`)}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-border/50 pt-10 sm:pt-12 md:pt-16">
          <div ref={blocksHeaderRef} className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2.5 sm:mb-4">
              {t("how.statsTitle")} <span className="text-primary">{t("how.statsHighlight")}</span>
            </h2>
            <p className="text-muted-foreground text-[13px] sm:text-sm md:text-base max-w-2xl mx-auto px-2 sm:px-0">
              {t("how.statsSubtitle")}
            </p>
          </div>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
};

export default HowItWorksSection;
