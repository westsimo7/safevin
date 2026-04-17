import AppNavbar from "@/components/AppNavbar";
import PageTitle from "@/components/PageTitle";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Rocket, Gift } from "lucide-react";

const currentPlan = "Starter"; // will be dynamic later

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
    ],
    cta: "Prova gratis",
    popular: false,
  },
  {
    name: "Starter",
    price: "8,99",
    period: "/mese",
    description: "Per iniziare a vendere meglio",
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
    ],
    cta: "Inizia ora",
    popular: false,
  },
  {
    name: "Pro",
    price: "14,99",
    period: "/mese",
    description: "Più visibilità, più conversioni",
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
    limitations: [],
    cta: "Attiva Pro",
    popular: true,
  },
  {
    name: "Expert",
    price: "34,99",
    period: "/mese",
    description: "Ecosistema completo per veri expert",
    icon: Rocket,
    features: [
      "60 annunci creabili",
      "Storico completo trimestrale",
      "Prezzo strategico avanzato",
      "Salvataggio creazioni incomplete",
      "Assistenza h24 prioritaria",
      "Accesso alla SAFEViN Creative Direction prioritaria",
      "6 annunci delegabili al team + 2 gratis",
      "Supporto prioritario avanzato",
      "Collaborazioni con il team di SAFEViN",
      "Coupon sconto personali",
      "Accesso prioritario alle nuove funzionalità",
    ],
    limitations: [],
    cta: "Passa a Expert",
    popular: false,
  },
];

const Pricing = () => {
  useSwipeBack("/home");

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">
      <AppNavbar />

      <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 pt-4 sm:pt-6 pb-8">
        <div className="max-w-5xl mx-auto">
          <PageTitle
            title="Scegli il tuo piano"
            subtitle="Ogni piano è pensato per darti strumenti concreti. Nessuna promessa vuota, solo metodo."
            backTo="/home"
            className="text-center"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {plans.map((plan) => {
              const isCurrent = plan.name === currentPlan;
              return (
                <div
                  key={plan.name}
                  className={`relative flex flex-col p-5 rounded-2xl transition-all duration-300 ${
                    isCurrent
                      ? "border-2 border-amber-500/60 bg-card shadow-lg shadow-amber-500/10"
                      : plan.popular
                        ? "border-2 border-primary/50 bg-card shadow-lg shadow-primary/10"
                        : "border border-border/50 bg-card/50 hover:border-border"
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px] px-2.5">
                        Piano attuale
                      </Badge>
                    </div>
                  )}
                  {plan.popular && !isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                        Il più venduto
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                      isCurrent ? "bg-amber-500/20" : plan.popular ? "bg-primary/20" : "bg-muted"
                    }`}>
                      <plan.icon className={`w-4 h-4 ${
                        isCurrent ? "text-amber-500" : plan.popular ? "text-primary" : "text-muted-foreground"
                      }`} />
                    </div>
                    <h3 className={`text-lg font-bold mb-1 ${
                      isCurrent ? "text-amber-500" : plan.popular ? "text-primary" : "text-foreground"
                    }`}>
                      {plan.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                  </div>

                  <div className="mb-4">
                    <span className="text-3xl font-bold text-foreground">€{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>

                  <ul className="space-y-2 mb-5 flex-grow">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isCurrent ? "bg-amber-500/10" : plan.popular ? "bg-primary/10" : "bg-muted"
                        }`}>
                          <Check className={`w-2.5 h-2.5 ${
                            isCurrent ? "text-amber-500" : plan.popular ? "text-primary" : "text-muted-foreground"
                          }`} />
                        </div>
                        <span className="text-foreground/80 text-xs">{feature}</span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation, i) => (
                      <li key={`lim-${i}`} className="flex items-start gap-2 opacity-40">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-muted">
                          <span className="text-[9px] text-muted-foreground">–</span>
                        </div>
                        <span className="text-muted-foreground text-xs line-through">{limitation}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={isCurrent ? "outline" : plan.popular ? "neon" : "glass"}
                    className="w-full text-sm"
                    size="lg"
                    disabled={isCurrent}
                  >
                    {isCurrent ? "Piano attuale" : plan.cta}
                  </Button>
                </div>
              );
            })}
          </div>

          <p className="text-center text-muted-foreground text-xs mt-8">
            Cancelli quando vuoi. Zero vincoli. Zero sorprese.
          </p>
        </div>
      </main>
      <BottomBar />
    </div>
  );
};

export default Pricing;
