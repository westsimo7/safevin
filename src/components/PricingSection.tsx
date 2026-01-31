import { Button } from "@/components/ui/button";
import { Check, Zap, Crown, Rocket } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "0",
    period: "3 giorni",
    description: "Prova il valore, senza rischi",
    icon: Zap,
    features: [
      "Accesso base dashboard",
      "1 analisi account",
      "1 utilizzo per componente",
      "Overview rischio base",
    ],
    limitations: [
      "Nessun simulatore",
      "Nessuno storico",
    ],
    cta: "Prova Safevin senza rischi",
    popular: false,
    variant: "glass" as const,
  },
  {
    name: "Plus",
    price: "19,98",
    period: "/mese",
    description: "Per venditori attivi",
    icon: Crown,
    features: [
      "Analisi illimitate",
      "Storico account completo",
      "Behavior check avanzato",
      "Suggerimenti operativi",
      "Alert rischio in aumento",
      "Priorità elaborazione",
    ],
    limitations: [],
    cta: "Inizia con Plus",
    popular: true,
    variant: "neon" as const,
  },
  {
    name: "Venditor Expert",
    price: "39,98",
    period: "/mese",
    description: "Per chi vive di Vinted",
    icon: Rocket,
    features: [
      "Tutto di Plus incluso",
      "Simulatore rischio avanzato",
      "Analisi profonde multi-pattern",
      "Suggerimenti personalizzati",
      "Monitoraggio continuo",
      "Educazione strategica",
      "Riduzione drastica probabilità ban",
    ],
    limitations: [],
    cta: "Proteggi il tuo business",
    popular: false,
    variant: "glass" as const,
  },
];

const PricingSection = () => {
  return (
    <section className="relative py-24 bg-card/20 overflow-hidden">
      {/* Subtle border top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Scegli il tuo livello di protezione
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Non ti promettiamo guadagni. Ti aiutiamo a non perdere ciò che hai costruito.
          </p>
        </div>
        
        {/* Pricing grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative flex flex-col p-6 rounded-2xl transition-all duration-300 ${
                plan.popular
                  ? "bg-card border-2 border-primary/50 shadow-lg shadow-primary/10"
                  : "bg-card/50 border border-border/50 hover:border-border"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    Più scelto
                  </div>
                </div>
              )}
              
              {/* Plan header */}
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
              
              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">€{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              
              {/* Features */}
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
              
              {/* CTA */}
              <Button variant={plan.variant} className="w-full" size="lg">
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
        
        {/* Trust message */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm">
            Disdici quando vuoi. Nessun dark pattern. Nessuna sorpresa.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
