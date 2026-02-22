import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card/30" />
      
      {/* Minimal accent glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[120px]" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center max-w-4xl">
        {/* AI Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">Ecosistema AI per Marketplace</span>
        </div>
        
        {/* Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-fade-in text-foreground">
          Ogni annuncio ha un potenziale.
          <br />
          <span className="text-primary">SAFEViN lo misura.</span>
        </h1>
        
        {/* Subheadline */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in leading-relaxed" style={{ animationDelay: "0.1s" }}>
          Analisi strutturale, scoring proprietario e correzioni operative
          per aumentare la <strong className="text-foreground">probabilità statistica di vendita</strong> su Vinted.
        </p>
        
        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <Link to="/dashboard">
            <Button variant="neon" size="lg" className="group w-full sm:w-auto">
              Accedi alla Dashboard
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Button variant="glass" size="lg">
            Scopri il metodo
          </Button>
        </div>
        
        {/* Trust indicators */}
        <div className="mt-16 pt-8 border-t border-border/50 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <p className="text-sm text-muted-foreground mb-4">Performance verificate su annunci reali</p>
          <div className="flex items-center justify-center gap-8 text-muted-foreground/60">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">10.000+</div>
              <div className="text-xs">Annunci ottimizzati</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">+35%</div>
              <div className="text-xs">Visibilità media</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">10</div>
              <div className="text-xs">Categorie SafeScore™</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
