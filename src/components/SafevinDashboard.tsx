import AppNavbar from "@/components/AppNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, PenTool, Sparkles, ShieldCheck, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const SafevinHome = () => {
  const navigate = useNavigate();
  const spring = { type: "spring" as const, stiffness: 80, damping: 18 };
  const snappy = { type: "spring" as const, stiffness: 120, damping: 14 };

  const features = [
    {
      icon: <PenTool className="w-5 h-5 text-primary" />,
      title: "Studio",
      desc: "Crea l'annuncio perfetto da zero con l'AI",
      onClick: () => navigate("/engine/studio"),
    },
    {
      icon: <Clock className="w-5 h-5 text-primary" />,
      title: "Continua i tuoi lavori",
      desc: "Riprendi gli annunci incompleti",
      onClick: () => navigate("/incomplete"),
    },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">
      <AppNavbar />

      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="container mx-auto px-5 sm:px-6 flex flex-col items-center">
          <div className="text-center max-w-3xl mx-auto mt-8 sm:mt-12 md:mt-16 pb-8">
            {/* Welcome badge */}
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.7 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ ...snappy, delay: 0.1 }}
            >
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-4 sm:mb-6 text-[11px] sm:text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                Benvenuto nel tuo centro di controllo
              </Badge>
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-4 sm:mb-6 overflow-hidden"
              initial="hidden"
              animate="visible"
            >
              <motion.span
                className="inline-block text-foreground"
                variants={{
                  hidden: { opacity: 0, y: 80, rotateX: 40 },
                  visible: { opacity: 1, y: 0, rotateX: 0 },
                }}
                transition={{ ...spring, delay: 0.25 }}
              >
                SAFE
              </motion.span>
              <motion.span
                className="inline-block text-primary"
                variants={{
                  hidden: { opacity: 0, y: 80, rotateX: 40 },
                  visible: { opacity: 1, y: 0, rotateX: 0 },
                }}
                transition={{ ...spring, delay: 0.35 }}
              >
                Vi
              </motion.span>
              <motion.span
                className="inline-block text-foreground"
                variants={{
                  hidden: { opacity: 0, y: 80, rotateX: 40 },
                  visible: { opacity: 1, y: 0, rotateX: 0 },
                }}
                transition={{ ...spring, delay: 0.45 }}
              >
                N
              </motion.span>
              <br />
              <motion.span
                className="inline-block text-primary text-glow-red"
                variants={{
                  hidden: { opacity: 0, scale: 0.3, filter: "blur(20px)" },
                  visible: { opacity: 1, scale: 1, filter: "blur(0px)" },
                }}
                transition={{ ...spring, delay: 0.6 }}
              >
                STUDIO
              </motion.span>
            </motion.h1>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ ...spring, delay: 0.7 }}
            >
              <Button
                variant="neon"
                size="lg"
                className="text-base sm:text-lg px-8 sm:px-12 py-5 sm:py-6 h-auto group animate-pulse-glow mb-4 sm:mb-6 w-full sm:w-auto"
                onClick={() => navigate("/engine/studio")}
              >
                Crea il tuo annuncio
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>

            {/* Description */}
            <motion.p
              className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2 sm:px-0"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
            >
              Crea annunci ottimizzati dall'AI.<br />
              Tutto in un unico posto, potenziato dall'intelligenza artificiale.
            </motion.p>

            {/* Feature cards */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-10 sm:mb-14 px-1 sm:px-0"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.12, delayChildren: 1.0 } },
              }}
            >
              {features.map((feat, i) => (
                <motion.div
                  key={i}
                  className="rounded-xl border border-border/50 bg-card/50 p-5 sm:p-6 text-left hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group cursor-pointer"
                  variants={{
                    hidden: { opacity: 0, y: 40, scale: 0.95 },
                    visible: { opacity: 1, y: 0, scale: 1 },
                  }}
                  transition={{ ...spring }}
                  onClick={feat.onClick}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    {feat.icon}
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1">{feat.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Studio deep-dive button */}
            <motion.div
              className="flex items-center justify-center px-2 sm:px-0"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 1.2 }}
            >
              <Button
                variant="outline"
                size="lg"
                className="h-auto py-3.5 sm:py-4 px-6 sm:px-8 border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all group w-full sm:w-auto"
                onClick={() => navigate("/about/studio")}
              >
                <div className="flex items-center gap-2.5">
                  <PenTool className="w-4 h-4 text-primary" />
                  <div className="text-left">
                    <span className="text-[10px] sm:text-xs text-muted-foreground block leading-none mb-0.5">
                      SAFE<span className="text-primary">ViN</span>
                    </span>
                    <span className="font-bold text-foreground text-sm">Studio</span>
                  </div>
                </div>
              </Button>
            </motion.div>

            {/* Trust badge */}
            <motion.div
              className="flex items-center justify-center gap-2 mt-10 sm:mt-14 mb-8 text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.4 }}
            >
              <ShieldCheck className="w-4 h-4 text-primary/60" />
              <span className="text-xs">AI-powered • Dati sicuri • Risultati in secondi</span>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SafevinHome;
