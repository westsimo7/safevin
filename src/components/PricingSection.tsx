import { Button } from "@/components/ui/button";
import { Check, Zap, Crown, Rocket } from "lucide-react";
import PaisleyPattern from "./PaisleyPattern";

const plans = [
  {
    name: "Starter",
    price: "19",
    description: "Per chi inizia il viaggio",
    icon: Zap,
    features: [
      "Fino a 50 annunci",
      "Automazione base",
      "Dashboard analytics",
      "Supporto email",
    ],
    popular: false,
  },
  {
    name: "Pro",
    price: "49",
    description: "Per venditori seri",
    icon: Crown,
    features: [
      "Annunci illimitati",
      "Automazione avanzata",
      "Analytics in tempo reale",
      "Supporto prioritario 24/7",
      "Anti-ban protection",
      "Ottimizzazione prezzi AI",
    ],
    popular: true,
  },
  {
    name: "Empire",
    price: "99",
    description: "Per dominare il mercato",
    icon: Rocket,
    features: [
      "Tutto di Pro",
      "Multi-account",
      "API access",
      "Account manager dedicato",
      "White-label options",
      "Custom integrations",
    ],
    popular: false,
  },
];

const PricingSection = () => {
  return (
    <section className="relative py-32 bg-background overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 text-foreground/5">
        <PaisleyPattern opacity={0.03} />
      </div>
      
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-neon-red/10 rounded-full blur-[200px]" />
      
      <div className="relative z-10 container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="text-foreground">Scegli il Tuo</span>{" "}
            <span className="text-gold">Potere</span>
          </h2>
          <p className="text-foreground/60 max-w-xl mx-auto">
            Piani flessibili per ogni livello di ambizione
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative group ${plan.popular ? "md:-mt-4 md:mb-4" : ""}`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <div className="px-4 py-1 rounded-full bg-gradient-to-r from-neon-red to-gold text-background text-sm font-bold shadow-lg">
                    PIÙ POPOLARE
                  </div>
                </div>
              )}
              
              {/* Card */}
              <div
                className={`relative h-full p-8 rounded-3xl backdrop-blur-xl overflow-hidden transition-all duration-500 ${
                  plan.popular
                    ? "bg-card/60 border-2 border-neon-red/50 shadow-[0_0_60px_rgba(255,0,0,0.2)]"
                    : "bg-card/40 border border-border/50 hover:border-gold/30"
                }`}
              >
                {/* Paisley pattern for Pro */}
                {plan.popular && (
                  <div className="absolute inset-0 text-neon-red">
                    <PaisleyPattern opacity={0.08} />
                  </div>
                )}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50" />
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                    plan.popular
                      ? "bg-gradient-to-br from-neon-red to-neon-red/50 shadow-[0_0_30px_rgba(255,0,0,0.4)]"
                      : "bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20"
                  }`}>
                    <plan.icon className={`w-7 h-7 ${plan.popular ? "text-white" : "text-gold"}`} />
                  </div>
                  
                  {/* Plan name */}
                  <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? "text-neon-red" : "text-foreground"}`}>
                    {plan.name}
                  </h3>
                  <p className="text-foreground/50 text-sm mb-6">{plan.description}</p>
                  
                  {/* Price */}
                  <div className="mb-8">
                    <span className="text-5xl font-black text-foreground">€{plan.price}</span>
                    <span className="text-foreground/50">/mese</span>
                  </div>
                  
                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          plan.popular ? "bg-neon-red/20" : "bg-gold/10"
                        }`}>
                          <Check className={`w-3 h-3 ${plan.popular ? "text-neon-red" : "text-gold"}`} />
                        </div>
                        <span className="text-foreground/70 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* CTA */}
                  <Button
                    variant={plan.popular ? "neon" : "glass"}
                    className="w-full"
                    size="lg"
                  >
                    {plan.popular ? "Inizia Ora" : "Scegli Piano"}
                  </Button>
                </div>
                
                {/* Border glow for popular */}
                {plan.popular && (
                  <>
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-red to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
