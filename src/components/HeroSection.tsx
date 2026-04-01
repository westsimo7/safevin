import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, LayoutDashboard, Eye, FileText, DollarSign, Shield, Camera } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const demoCategories = [
  { label: "Attenzione", icon: Eye, score: 82 },
  { label: "Chiarezza", icon: FileText, score: 68 },
  { label: "Valore", icon: DollarSign, score: 75 },
  { label: "Fiducia", icon: Shield, score: 80 },
  { label: "Immagini", icon: Camera, score: 52 },
];

const getScoreColor = (score: number) => {
  if (score >= 75) return "text-green-500";
  if (score >= 55) return "text-yellow-500";
  if (score >= 48) return "text-orange-500";
  return "text-red-500";
};

const getBarColor = (score: number) => {
  if (score >= 75) return "bg-green-500";
  if (score >= 55) return "bg-yellow-500";
  if (score >= 48) return "bg-orange-500";
  return "bg-red-500";
};

const HeroSection = () => {
  const badgeRef = useScrollReveal({ direction: "down", delay: 0, duration: 0.7, distance: 30 });
  const titleRef = useScrollReveal({ direction: "up", delay: 0.15, duration: 0.8 });
  const descRef = useScrollReveal({ direction: "up", delay: 0.3, duration: 0.8 });
  const ctaRef = useScrollReveal({ direction: "up", delay: 0.45, duration: 0.8 });
  const cardRef = useScrollReveal({ direction: "up", delay: 0.6, duration: 0.9, distance: 80 });

  const totalScore = 72;

  return (
    <section className="relative min-h-[60vh] sm:min-h-[70vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card/30" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] sm:w-[600px] h-[200px] sm:h-[300px] bg-primary/5 rounded-full blur-[120px]" />

      <div className="relative z-10 container mx-auto px-5 sm:px-6 text-center max-w-4xl">
        <div ref={badgeRef} className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm mt-4 sm:mt-6 mb-4 sm:mb-5 md:mb-8">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] sm:text-xs md:text-sm font-medium text-muted-foreground">Ecosistema AI per Marketplace</span>
        </div>

        <h1 ref={titleRef} className="text-[1.625rem] sm:text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-3 sm:mb-4 md:mb-6 text-foreground leading-[1.2]">
          Vendi meglio su Vinted.
          <br />
          <span className="text-primary">SAFEViN ti mostra come.</span>
        </h1>

        <p ref={descRef} className="text-sm sm:text-base md:text-xl text-muted-foreground max-w-2xl mx-auto mb-5 sm:mb-6 md:mb-10 leading-relaxed px-2 sm:px-0">
          Audit strutturale, scoring proprietario e annunci ottimizzati dall'IA
          per aumentare la <strong className="text-foreground">probabilità statistica di vendita</strong>.
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 md:gap-4 justify-center px-2 sm:px-0">
          <Button variant="neon" size="lg" className="group w-full sm:w-auto cursor-not-allowed opacity-70 h-12 sm:h-11 text-sm sm:text-base" disabled>
            Inizia gratis (3 giorni)
            <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Link to="/dashboard" className="w-full sm:w-auto">
            <Button variant="glass" size="lg" className="w-full sm:w-auto h-12 sm:h-11 text-sm sm:text-base">
              <LayoutDashboard className="mr-2 w-4 h-4" />
              Dashboard
            </Button>
          </Link>
        </div>

        {/* SafeScore Demo Card */}
        <div ref={cardRef} className="mt-6 sm:mt-8 md:mt-14 px-2 sm:px-0">
          <div className="inline-block p-4 sm:p-5 md:p-6 rounded-2xl bg-card border border-border/50 shadow-lg w-full max-w-xs sm:max-w-sm text-left">
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground text-center mb-2 sm:mb-3">SafeScore™ Preview</p>

            {/* Main score */}
            <div className="flex items-baseline justify-center gap-1 mb-3 sm:mb-4">
              <span className={`text-3xl sm:text-4xl md:text-5xl font-bold tabular-nums ${getScoreColor(totalScore)}`}>
                {totalScore}%
              </span>
              <span className="text-sm sm:text-base text-muted-foreground">/100%</span>
            </div>

            {/* Category breakdown */}
            <div className="space-y-2 sm:space-y-2.5">
              {demoCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div key={cat.label} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                        <span className="text-[11px] sm:text-xs font-medium text-foreground">{cat.label}</span>
                      </div>
                      <span className={`text-[11px] sm:text-xs font-bold tabular-nums ${getScoreColor(cat.score)}`}>
                        {cat.score}%
                      </span>
                    </div>
                    <div className="h-1 sm:h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getBarColor(cat.score)}`}
                        style={{ width: `${cat.score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
