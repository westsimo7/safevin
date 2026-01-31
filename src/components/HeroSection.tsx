import { Button } from "@/components/ui/button";
import { ArrowRight, Shield } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card/30" />
      
      {/* Minimal accent glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[120px]" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center max-w-4xl">
        {/* Trust badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/50 backdrop-blur-sm mb-8 animate-fade-in">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">Sistema di prevenzione ban per Vinted</span>
        </div>
        
        {/* Headline - Direct, no hype */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-fade-in text-foreground">
          Salva il tuo Vinted.
          <br />
          <span className="text-primary">Prima che sia troppo tardi.</span>
        </h1>
        
        {/* Subheadline - Clear value proposition */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in leading-relaxed" style={{ animationDelay: "0.1s" }}>
          Safevin è un sistema che analizza i comportamenti del tuo account e ti dice cosa ti sta mettendo a rischio, <strong className="text-foreground">prima che Vinted lo faccia per te.</strong>
        </p>
        
        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <Button variant="neon" size="lg" className="group">
            Analizza il tuo account
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="glass" size="lg">
            Come funziona Safevin
          </Button>
        </div>
        
        {/* Trust indicators - Subtle, professional */}
        <div className="mt-16 pt-8 border-t border-border/50 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <p className="text-sm text-muted-foreground mb-4">Usato da venditori che proteggono il loro business</p>
          <div className="flex items-center justify-center gap-8 text-muted-foreground/60">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">2.500+</div>
              <div className="text-xs">Account analizzati</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">87%</div>
              <div className="text-xs">Rischi identificati</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">Zero</div>
              <div className="text-xs">Promesse vuote</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
