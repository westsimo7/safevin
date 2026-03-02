import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-[70vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card/30" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[120px]" />

      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm mt-6 mb-5 md:mb-8 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
          <span className="text-xs md:text-sm font-medium text-muted-foreground">Ecosistema AI per Marketplace</span>
        </div>

        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6 animate-fade-in text-foreground">
          Vendi meglio su Vinted.
          <br />
          <span className="text-primary">SAFEViN ti mostra come.</span>
        </h1>

        <p className="text-sm md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 md:mb-10 animate-fade-in leading-relaxed" style={{ animationDelay: "0.1s" }}>
          Audit strutturale, scoring proprietario e annunci ottimizzati dall'IA
          per aumentare la <strong className="text-foreground">probabilità statistica di vendita</strong>.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <Button variant="neon" size="lg" className="group w-full sm:w-auto cursor-not-allowed opacity-70" disabled>
            Inizia gratis (3 giorni)
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Link to="/dashboard">
            <Button variant="glass" size="lg" className="w-full sm:w-auto">
              <LayoutDashboard className="mr-2 w-4 h-4" />
              Dashboard
            </Button>
          </Link>
        </div>

        {/* Mini demo card */}
        <div className="mt-8 md:mt-14 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="inline-block p-4 md:p-6 rounded-2xl bg-card border border-border/50 shadow-lg max-w-sm">
            <p className="text-xs text-muted-foreground mb-2">SafeScore™ Preview</p>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl md:text-4xl font-black text-primary">78</span>
              <span className="text-base md:text-lg text-muted-foreground">/100</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Titolo</span>
                <span className="text-green-500 font-medium">9/10</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Descrizione</span>
                <span className="text-yellow-500 font-medium">6/10</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Foto</span>
                <span className="text-red-500 font-medium">4/10</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
