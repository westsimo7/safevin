import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import PaisleyPattern from "./PaisleyPattern";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Paisley Pattern Background */}
      <div className="absolute inset-0 text-neon-red">
        <PaisleyPattern opacity={0.08} />
      </div>
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background opacity-50" />
      
      {/* Red glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-neon-red/20 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-gold/10 rounded-full blur-[100px]" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neon-red/30 bg-neon-red/5 backdrop-blur-sm mb-8 animate-fade-in">
          <Zap className="w-4 h-4 text-neon-red" />
          <span className="text-sm font-medium text-foreground/80">Il futuro del reselling è qui</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 animate-fade-in">
          <span className="text-foreground">SAFE</span>
          <span className="text-neon-red text-glow-red">VIN</span>
        </h1>
        
        <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gold mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          Domina il mercato.
        </p>
        
        <p className="text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto mb-12 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          Velocità e Profitto Automatico per i venditori professionisti di Vinted.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <Button variant="neon" size="lg" className="group">
            Inizia Ora
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="glass" size="lg">
            Scopri di più
          </Button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: "0.4s" }}>
          {[
            { value: "10K+", label: "Venditori Attivi" },
            { value: "€2M+", label: "Volume Vendite" },
            { value: "99.9%", label: "Uptime Garantito" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-black text-neon-red text-glow-red">{stat.value}</div>
              <div className="text-sm text-foreground/50 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
