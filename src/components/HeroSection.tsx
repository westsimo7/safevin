import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, LayoutDashboard, Eye, FileText, DollarSign, Shield, Camera } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { motion } from "framer-motion";

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

const spring = { type: "spring" as const, stiffness: 70, damping: 16 };

const HeroSection = () => {
  const descRef = useScrollReveal({ direction: "up", delay: 0.3, duration: 0.8 });
  const cardRef = useScrollReveal({ direction: "up", delay: 0.6, duration: 0.9, distance: 80 });

  const totalScore = 72;

  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden bg-background">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card/30" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] sm:w-[800px] h-[300px] sm:h-[400px] bg-primary/5 rounded-full blur-[150px]" />

      <div className="relative z-10 container mx-auto px-5 sm:px-6 text-center max-w-4xl">
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -30, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...spring, delay: 0.1 }}
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] sm:text-xs md:text-sm font-medium text-muted-foreground">Ecosistema AI per Marketplace</span>
        </motion.div>

        {/* LOGO — hero element */}
        <motion.div
          className="mb-4 sm:mb-6"
          initial={{ opacity: 0, rotateX: 50, y: 60, scale: 0.5 }}
          animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
          transition={{ ...spring, delay: 0.2, stiffness: 60 }}
          style={{ perspective: "800px" }}
        >
          <h1 className="text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black tracking-tighter leading-none select-none">
            <span
              className="text-foreground inline-block"
              style={{
                textShadow:
                  "0 2px 0 hsl(200 10% 20%), 0 4px 0 hsl(200 10% 16%), 0 6px 0 hsl(200 10% 12%), 0 8px 12px hsl(0 0% 0% / 0.35)",
              }}
            >
              SAFE
            </span>
            <motion.span
              className="text-primary inline-block"
              style={{
                textShadow:
                  "0 2px 0 hsl(174 65% 24%), 0 4px 0 hsl(174 65% 18%), 0 6px 0 hsl(174 65% 12%), 0 8px 12px hsl(174 65% 10% / 0.4)",
              }}
              animate={{
                textShadow: [
                  "0 2px 0 hsl(174 65% 24%), 0 4px 0 hsl(174 65% 18%), 0 6px 0 hsl(174 65% 12%), 0 8px 12px hsl(174 65% 10% / 0.4)",
                  "0 2px 0 hsl(174 65% 24%), 0 4px 0 hsl(174 65% 18%), 0 6px 0 hsl(174 65% 12%), 0 8px 24px hsl(174 65% 34% / 0.7)",
                  "0 2px 0 hsl(174 65% 24%), 0 4px 0 hsl(174 65% 18%), 0 6px 0 hsl(174 65% 12%), 0 8px 12px hsl(174 65% 10% / 0.4)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              ViN
            </motion.span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-medium mb-6 sm:mb-8 tracking-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.5 }}
        >
          Vendi meglio su Vinted.<br />
          <span className="text-foreground font-semibold">SAFEViN ti mostra come.</span>
        </motion.p>

        {/* CTA Buttons — big */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2 sm:px-0 mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...spring, delay: 0.65 }}
        >
          <Button variant="neon" size="lg" className="group w-full sm:w-auto cursor-not-allowed opacity-70 h-14 sm:h-14 text-base sm:text-lg px-8 sm:px-12" disabled>
            Inizia gratis (3 giorni)
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Link to="/home" className="w-full sm:w-auto">
            <Button variant="glass" size="lg" className="w-full sm:w-auto h-14 sm:h-14 text-base sm:text-lg px-8 sm:px-10">
              <LayoutDashboard className="mr-2 w-5 h-5" />
              Home
            </Button>
          </Link>
        </motion.div>

        {/* Description */}
        <motion.p
          ref={descRef}
          className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed px-2 sm:px-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.85 }}
        >
          Audit strutturale, scoring proprietario e annunci ottimizzati dall'IA
          per aumentare la <strong className="text-foreground">probabilità statistica di vendita</strong>.
        </motion.p>

        {/* SafeScore Demo Card */}
        <div ref={cardRef} className="px-2 sm:px-0">
          <div className="inline-block p-4 sm:p-5 md:p-6 rounded-2xl bg-card border border-border/50 shadow-lg w-full max-w-xs sm:max-w-sm text-left">
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground text-center mb-2 sm:mb-3">SafeScore™ Preview</p>

            <div className="flex items-baseline justify-center gap-1 mb-3 sm:mb-4">
              <span className={`text-3xl sm:text-4xl md:text-5xl font-bold tabular-nums ${getScoreColor(totalScore)}`}>
                {totalScore}%
              </span>
              <span className="text-sm sm:text-base text-muted-foreground">/100%</span>
            </div>

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
