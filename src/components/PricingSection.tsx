import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Zap, Crown, Rocket, Gift, Loader2 } from "lucide-react";
import { useScrollReveal, useStaggerReveal } from "@/hooks/useScrollReveal";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import OfferTimer from "@/components/OfferTimer";
import BundlePurchaseCard from "@/components/BundlePurchaseCard";
import ApplePayButton from "@/components/ApplePayButton";

type PlanKey = "pro" | "expert";

const planDefs = [
  { key: "pro" as PlanKey, name: "Pro", price: "12,99", oldPrice: "15,99", icon: Crown, popular: true, variant: "neon" as const, hasPeriod: true },
  { key: "expert" as PlanKey, name: "Expert", price: "34,99", oldPrice: null as string | null, icon: Rocket, popular: false, variant: "glass" as const, hasPeriod: true },
];

const PricingSection = () => {
  const headerRef = useScrollReveal({ direction: "up", duration: 0.7 });
  const gridRef = useStaggerReveal({ direction: "up", stagger: 0.15, distance: 60 });
  const footerRef = useScrollReveal({ direction: "up", delay: 0.3, duration: 0.6, distance: 20 });

  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // children layout: [bundle, pro, expert] — Pro is at index 1
  const popularIndex = 1;
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);

  useEffect(() => {
    if (isMobile && scrollContainerRef.current && popularIndex >= 0) {
      const container = scrollContainerRef.current;
      const cards = container.children;
      if (cards[popularIndex]) {
        const card = cards[popularIndex] as HTMLElement;
        const scrollLeft = card.offsetLeft - (container.offsetWidth - card.offsetWidth) / 2;
        container.scrollTo({ left: scrollLeft, behavior: "instant" });
      }
    }
  }, [isMobile, popularIndex]);

  const handlePlanClick = async (planKey: PlanKey) => {
    if (!user) {
      navigate(`/auth?checkout=${planKey}`);
      return;
    }
    setLoadingPlan(planKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan: planKey },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error(t("pricing.errors.noCheckoutUrl"));
      }
    } catch (e: any) {
      toast({
        title: t("pricing.errors.title"),
        description: e?.message ?? t("pricing.errors.cantStartPayment"),
        variant: "destructive",
      });
      setLoadingPlan(null);
    }
  };

  return (
    <section className="relative py-8 sm:py-12 md:py-16 bg-card/20 overflow-hidden" id="pricing">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-5 sm:px-6 max-w-7xl">
        <div ref={headerRef} className="text-center mb-5 sm:mb-8 md:mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-1.5 sm:mb-3">
            {t("pricing.title")}
          </h2>
          <p className="text-muted-foreground text-[13px] sm:text-sm md:text-base max-w-xl mx-auto px-2 sm:px-0">
            {t("pricing.subtitle")}
          </p>
        </div>

        <div
          ref={(el) => {
            scrollContainerRef.current = el;
            if (gridRef && typeof gridRef === 'object' && 'current' in gridRef) {
              (gridRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
            }
          }}
          className="flex lg:grid lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 overflow-x-auto lg:overflow-x-visible overflow-y-visible snap-x snap-mandatory scrollbar-hide py-6 lg:py-8 -mx-5 px-5 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0"
        >
          <BundlePurchaseCard />
          {planDefs.map((plan, index) => {
            const isExpert = plan.key === "expert";

            const accent = isExpert
              ? { border: "border-yellow-400/60", shadow: "shadow-yellow-400/10", bg: "bg-yellow-400/20", iconBg: "bg-yellow-400/10", text: "text-yellow-400" }
              : plan.popular
                ? { border: "border-orange-500/60", shadow: "shadow-orange-500/10", bg: "bg-orange-500/20", iconBg: "bg-orange-500/10", text: "text-orange-500" }
                : { border: "border-border/50", shadow: "", bg: "bg-muted", iconBg: "bg-muted", text: "text-foreground" };

            const cardBorder = (isExpert || plan.popular)
              ? `border-2 ${accent.border} bg-card shadow-lg ${accent.shadow}`
              : `border ${accent.border} bg-card/50 hover:border-border`;

            const features = t(`pricing.plans.${plan.key}.features`, { returnObjects: true }) as string[];
            const limitations = t(`pricing.plans.${plan.key}.limitations`, { returnObjects: true }) as string[];

            return (
              <div
                key={index}
                data-reveal
                className={`relative flex flex-col p-4 sm:p-5 rounded-2xl transition-all duration-300 w-[85vw] sm:w-[45vw] md:w-[42vw] lg:w-auto min-w-0 snap-center flex-shrink-0 lg:flex-shrink ${cardBorder} ${plan.popular ? "animate-pro-glow" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <div className="badge-pulse px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-bold font-heading whitespace-nowrap">
                      {t("pricing.badges.popular")}
                    </div>
                  </div>
                )}
                {isExpert && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <div className="px-3 py-1 rounded-full bg-yellow-400 text-background text-xs font-semibold whitespace-nowrap shadow-lg shadow-yellow-400/30">
                      {t("pricing.badges.expert")}
                    </div>
                  </div>
                )}

                <div className="mb-3 sm:mb-4">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-2 sm:mb-3 ${accent.bg}`}>
                    <plan.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${accent.text}`} />
                  </div>
                  <h3 className={`text-lg sm:text-xl font-bold mb-1 ${accent.text}`}>
                    {plan.name}
                  </h3>
                  <p className="text-[13px] sm:text-sm text-muted-foreground whitespace-pre-line">
                    {t(`pricing.plans.${plan.key}.description`)}
                  </p>
                </div>

                <div className="mb-3 sm:mb-4 flex items-baseline gap-2 flex-wrap">
                  {plan.oldPrice && (
                    <span className="text-base sm:text-lg text-muted-foreground line-through">€{plan.oldPrice}</span>
                  )}
                  <span className="text-3xl sm:text-4xl font-bold text-foreground">€{plan.price}</span>
                  {plan.hasPeriod && (
                    <span className="text-muted-foreground text-[13px] sm:text-sm">{t("pricing.perMonth")}</span>
                  )}
                </div>

                <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-5 flex-grow">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${accent.iconBg}`}>
                        <Check className={`w-2.5 h-2.5 ${accent.text}`} />
                      </div>
                      <span className="text-foreground/80 text-[12.5px] sm:text-[13px] leading-snug">{feature}</span>
                    </li>
                  ))}
                  {limitations.map((limitation, i) => (
                    <li key={`lim-${i}`} className="flex items-start gap-2 opacity-50">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-muted">
                        <span className="text-[10px] text-muted-foreground">–</span>
                      </div>
                      <span className="text-muted-foreground text-[12.5px] sm:text-[13px] leading-snug line-through">{limitation}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-2">
                  <Button
                    variant={plan.variant}
                    className="w-full h-10 sm:h-11 text-sm"
                    disabled={loadingPlan !== null}
                    onClick={() => handlePlanClick(plan.key)}
                  >
                    {loadingPlan === plan.key ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      t(`pricing.plans.${plan.key}.cta`)
                    )}
                  </Button>
                  <ApplePayButton
                    onClick={() => handlePlanClick(plan.key)}
                    loading={loadingPlan === plan.key}
                    prewarmFn="create-checkout"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div ref={footerRef} className="mt-5 sm:mt-8 text-center">
          <p className="text-muted-foreground text-[13px] sm:text-sm">
            {t("pricing.footer")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
