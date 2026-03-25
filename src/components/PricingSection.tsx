import { Button } from "@/components/ui/button";
import { Check, Zap, Crown, Rocket } from "lucide-react";
import { useScrollReveal, useStaggerReveal } from "@/hooks/useScrollReveal";

const plans = [
  {
    name: "Starter",
    price: "0",
    period: "3 giorni",
    description: "Scopri il metodo SafeViN senza impegno",
    icon: Zap,
    features: [
      "2 Audit Annuncio",
      
      "1 Studio export",
      "Storico ultime 3 sessioni",
      "SafeScore™ su 10 categorie",
    ],
    limitations: [
      "Nessun accesso avanzato",
    ],
    cta: "Inizia gratuitamente",
    popular: false,
    variant: "glass" as const,
  },
  {
    name: "Class",
    price: "12,76",
    period: "/mese",
    description: "Per chi vende con metodo",
    icon: Crown,
    features: [
      "30 Audit Annuncio / mese",
      
      "30 Studio / mese",
      "Storico completo mensile",
      "Export testi ottimizzati",
      "Breakdown per categoria",
      "Correzioni prioritizzate",
    ],
    limitations: [],
    cta: "Attiva Class",
    popular: true,
    variant: "neon" as const,
  },
  {
    name: "Expert",
    price: "32,76",
    period: "/mese",
    description: "Per venditori professionisti",
    icon: Rocket,
    features: [
      "Audit Annuncio illimitati",
      
      "Studio illimitato",
      "Storico illimitato",
      "Preset avanzati / template premium",
      "Priorità supporto",
      "Massima probabilità di conversione",
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

  return (
    <section className="relative py-24 bg-card/20 overflow-hidden" id="pricing">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-6 max-w-6xl">
        <div ref={headerRef} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Scegli il tuo piano
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Ogni piano è pensato per darti strumenti concreti. Nessuna promessa vuota, solo metodo.
          </p>
        </div>

        <div ref={gridRef} className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              data-reveal
              className={`relative flex flex-col p-6 rounded-2xl transition-all duration-300 ${
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

              <div className="mb-6">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
                  plan.popular ? "bg-primary/20" : "bg-muted"
                }`}>
                  <plan.icon className={`w-5 h-5 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <h3 className={`text-xl font-bold mb-1 ${plan.popular ? "text-primary" : "text-foreground"}`}>
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-6 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      plan.popular ? "bg-primary/10" : "bg-muted"
                    }`}>
                      <Check className={`w-3 h-3 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <span className="text-foreground/80 text-sm">{feature}</span>
                  </li>
                ))}
                {plan.limitations.map((limitation, i) => (
                  <li key={`lim-${i}`} className="flex items-start gap-2 opacity-50">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-muted">
                      <span className="text-xs text-muted-foreground">–</span>
                    </div>
                    <span className="text-muted-foreground text-sm line-through">{limitation}</span>
                  </li>
                ))}
              </ul>

              <Button variant={plan.variant} className="w-full" size="lg" disabled>
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        <div ref={footerRef} className="mt-12 text-center">
          <p className="text-muted-foreground text-sm">
            Cancelli quando vuoi. Zero vincoli. Zero sorprese.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
