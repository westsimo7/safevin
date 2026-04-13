import { useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Check, Zap, Crown, Rocket, Gift } from "lucide-react";
import { useScrollReveal, useStaggerReveal } from "@/hooks/useScrollReveal";
import { useIsMobile } from "@/hooks/use-mobile";

const plans = [
  {
    name: "Free",
    price: "0",
    period: "",
    description: "Prova gratis",
    icon: Gift,
    features: [
      "2 annunci creabili",
      "Storico sui 2 annunci",
      "Prezzo strategico",
    ],
    limitations: [
      "Salvataggio creazioni incomplete",
      "Assistenza h24",
      "Accesso alla SAFEViN Creative Direction",
      "3 annunci delegabili al team SAFEViN Creative Direction",
      "Supporto avanzato",
      "Sezione Upgrade per lasciare consigli e migliorare la piattaforma con commissioni",
      "Collaborazioni con il team di SAFEViN",
      "Coupon sconto personali",
      "Accesso prioritario alle nuove funzionalità",
    ],
    cta: "Prova gratis",
    popular: false,
    variant: "glass" as const,
  },
  {
    name: "Starter",
    price: "8,99",
    period: "/mese",
    description: "Per iniziare a vendere meglio\nOttimizza i tuoi primi annunci",
    icon: Zap,
    features: [
      "10 annunci creabili",
      "Storico ultime 3 sessioni",
      "Prezzo strategico",
      "Salvataggio creazioni incomplete",
      "Assistenza h24",
    ],
    limitations: [
      "Accesso alla SAFEViN Creative Direction",
      "3 annunci delegabili al team SAFEViN Creative Direction",
      "Supporto avanzato",
      "Sezione Upgrade per lasciare consigli e migliorare la piattaforma con commissioni",
      "Collaborazioni con il team di SAFEViN",
      "Coupon sconto personali",
      "Accesso prioritario alle nuove funzionalità",
    ],
    cta: "Inizia ora",
    popular: false,
    variant: "glass" as const,
  },
  {
    name: "Pro",
    price: "14,99",
    period: "/mese",
    description: "Per vendere con costanza\nPiù visibilità, più conversioni",
    icon: Crown,
    features: [
      "25 annunci creabili",
      "Storico completo mensile",
      "Prezzo strategico avanzato",
      "Salvataggio creazioni incomplete",
      "Assistenza h24",
      "Accesso alla SAFEViN Creative Direction",
      "2 annunci delegabili al team SAFEViN Creative Direction",
      "Supporto avanzato",
    ],
    limitations: [
      "Sezione Upgrade per lasciare consigli e migliorare la piattaforma con commissioni",
      "Collaborazioni con il team di SAFEViN",
      "Coupon sconto personali",
      "Accesso prioritario alle nuove funzionalità",
    ],
    cta: "Attiva Pro",
    popular: true,
    variant: "neon" as const,
  },
  {
    name: "Expert",
    price: "34,99",
    period: "/mese",
    description: "Per massimizzare ogni annuncio\nEcosistema completo per veri expert",
    icon: Rocket,
    features: [
      "60 annunci creabili",
      "Storico completo trimestrale",
      "Prezzo strategico avanzato",
      "Salvataggio creazioni incomplete",
      "Assistenza h24 prioritaria",
      "Accesso alla SAFEViN Creative Direction prioritaria",
      "6 annunci delegabili al team SAFEViN Creative Direction + 2 gratis",
      "Supporto prioritario avanzato",
      "Sezione Upgrade per lasciare consigli e migliorare la piattaforma con commissioni",
      "Collaborazioni con il team di SAFEViN",
      "Coupon sconto personali",
      "Accesso prioritario alle nuove funzionalità",
    ],
    limitations: [],
    cta: "Passa a Expert",
    popular: false,
    variant: "glass" as const,
  },
];

const PricingSection = () => {
  const headerRef = useScrollReveal({ direction: "up", duration: 0.7 });
  const gridRef = useStaggerReveal({ direction: "up", stagger: 0.15, distance: 60 });
  const footerRef = useScrollReveal({ direction: "up", delay: 0.3, duration: 0.6, distance: 20 });

  const isMobile = useIsMobile();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const popularIndex = plans.findIndex(p => p.popular);

  useEffect(() => {
    if (isMobile && scrollContainerRef.current && popularIndex >= 0) {
      const container = scrollContainerRef.current;
      const cards = container.children;
      if (cards[popularIndex]) {
        const card = cards[popularIndex] as HTMLElement;
        // Center the popular card in view
        const scrollLeft = card.offsetLeft - (container.offsetWidth - card.offsetWidth) / 2;
        container.scrollTo({ left: scrollLeft, behavior: "instant" });
      }
    }
  }, [isMobile, popularIndex]);

  return (
    <section className="relative py-14 sm:py-20 md:py-24 bg-card/20 overflow-hidden" id="pricing">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-5 sm:px-6 max-w-7xl">
        <div ref={headerRef} className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2.5 sm:mb-4">
            Scegli il tuo piano
          </h2>
          <p className="text-muted-foreground text-[13px] sm:text-sm md:text-base max-w-xl mx-auto px-2 sm:px-0">
            Ogni piano è pensato per darti strumenti concreti. Nessuna promessa vuota, solo metodo.
          </p>
        </div>

        {/* Mobile/Tablet: horizontal scroll, Desktop: grid */}
        <div
          ref={(el) => {
            scrollContainerRef.current = el;
            if (gridRef && typeof gridRef === 'object' && 'current' in gridRef) {
              (gridRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
            }
          }}
          className="flex lg:grid lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 overflow-x-auto lg:overflow-x-visible snap-x snap-mandatory scrollbar-hide pb-4 lg:pb-0 -mx-5 px-5 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0"
        >
          {plans.map((plan, index) => (
            <div
              key={index}
              data-reveal
              className={`relative flex flex-col p-5 sm:p-6 rounded-2xl transition-all duration-300 w-[85vw] sm:w-[45vw] md:w-[42vw] lg:w-auto min-w-0 snap-center flex-shrink-0 lg:flex-shrink ${
                plan.popular
                  ? "bg-card border-2 border-primary/50 shadow-lg shadow-primary/10"
                  : "bg-card/50 border border-border/50 hover:border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    Consigliato
                  </div>
                </div>
              )}

              <div className="mb-4 sm:mb-6">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-3 sm:mb-4 ${
                  plan.popular ? "bg-primary/20" : "bg-muted"
                }`}>
                  <plan.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <h3 className={`text-lg sm:text-xl font-bold mb-1 ${plan.popular ? "text-primary" : "text-foreground"}`}>
                  {plan.name}
                </h3>
                <p className="text-[13px] sm:text-sm text-muted-foreground whitespace-pre-line">{plan.description}</p>
              </div>

              <div className="mb-4 sm:mb-6">
                <span className="text-3xl sm:text-4xl font-bold text-foreground">€{plan.price}</span>
                <span className="text-muted-foreground text-[13px] sm:text-sm">{plan.period}</span>
              </div>

              <ul className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className={`w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      plan.popular ? "bg-primary/10" : "bg-muted"
                    }`}>
                      <Check className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <span className="text-foreground/80 text-[13px] sm:text-sm">{feature}</span>
                  </li>
                ))}
                {plan.limitations.map((limitation, i) => (
                  <li key={`lim-${i}`} className="flex items-start gap-2 opacity-50">
                    <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-muted">
                      <span className="text-[10px] sm:text-xs text-muted-foreground">–</span>
                    </div>
                    <span className="text-muted-foreground text-[13px] sm:text-sm line-through">{limitation}</span>
                  </li>
                ))}
              </ul>

              <Button variant={plan.variant} className="w-full h-11 sm:h-auto text-sm" size="lg" disabled>
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        <div ref={footerRef} className="mt-8 sm:mt-12 text-center">
          <p className="text-muted-foreground text-[13px] sm:text-sm">
            Cancelli quando vuoi. Zero vincoli. Zero sorprese.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
