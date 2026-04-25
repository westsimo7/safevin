import { AlertTriangle } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useTranslation } from "react-i18next";

const DisclaimerSection = () => {
  const ref = useScrollReveal({ direction: "up", duration: 0.7, distance: 30 });
  const { t } = useTranslation();

  return (
    <section className="py-8 sm:py-12 bg-background">
      <div ref={ref} className="container mx-auto px-5 sm:px-6 max-w-3xl">
        <div className="p-4 sm:p-6 rounded-2xl border border-border/50 bg-card/50">
          <div className="flex items-start gap-2.5 sm:gap-3">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1.5 sm:space-y-2">
              <p className="text-[13px] sm:text-sm font-semibold text-foreground">{t("disclaimer.label")}</p>
              <p className="text-[13px] sm:text-sm text-muted-foreground leading-relaxed">
                <strong>{t("disclaimer.p1")}</strong>
              </p>
              <p className="text-[13px] sm:text-sm text-muted-foreground leading-relaxed">
                {t("disclaimer.p2")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DisclaimerSection;
