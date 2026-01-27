import { Zap, Shield, TrendingUp } from "lucide-react";
import PaisleyPattern from "./PaisleyPattern";

const features = [
  {
    icon: Zap,
    title: "Velocità Estrema",
    description: "Automazione fulminea per pubblicare e gestire i tuoi annunci in millisecondi. Vinci sempre la competizione.",
  },
  {
    icon: Shield,
    title: "Protezione Totale",
    description: "Sistema anti-ban avanzato e protezione delle transazioni. Il tuo business è al sicuro con SafeVin.",
  },
  {
    icon: TrendingUp,
    title: "Profitto Massimo",
    description: "Analisi intelligente dei prezzi e ottimizzazione automatica per massimizzare i tuoi guadagni.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="relative py-32 bg-background overflow-hidden">
      {/* Subtle paisley background */}
      <div className="absolute inset-0 text-foreground/5">
        <PaisleyPattern opacity={0.03} />
      </div>
      
      {/* Glow effects */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-cyan/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-neon-red/10 rounded-full blur-[120px]" />
      
      <div className="relative z-10 container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="text-gold">Funzionalità</span>{" "}
            <span className="text-neon-red text-glow-red">Killer</span>
          </h2>
          <p className="text-foreground/60 max-w-xl mx-auto">
            Strumenti progettati per dominare il mercato del reselling
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full p-8 rounded-2xl bg-card/50 backdrop-blur-xl border border-border/50 overflow-hidden transition-all duration-500 hover:border-neon-red/50 hover:shadow-[0_0_40px_rgba(255,0,0,0.15)]">
                {/* Hidden paisley pattern on hover */}
                <div className="absolute inset-0 text-neon-red opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <PaisleyPattern opacity={0.1} />
                </div>
                
                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon container */}
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-neon-red/20 to-neon-red/5 border border-neon-red/20 flex items-center justify-center mb-6 group-hover:shadow-[0_0_30px_rgba(255,0,0,0.3)] transition-shadow duration-500">
                    <feature.icon className="w-8 h-8 text-neon-red" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-gold transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-foreground/60 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                
                {/* Bottom glow line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-red to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
