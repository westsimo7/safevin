import AppNavbar from "@/components/AppNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, ArrowRight, Search, PenTool } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const SafevinDashboard = () => {
  const navigate = useNavigate();

  // GSAP-style spring config
  const spring = { type: "spring" as const, stiffness: 80, damping: 18 };
  const snappy = { type: "spring" as const, stiffness: 120, damping: 14 };

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="container mx-auto px-6 flex flex-col items-center">
        <div className="text-center max-w-3xl mx-auto mt-12 md:mt-16">
          {/* Badge — drops down with bounce */}
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...snappy, delay: 0.1 }}
          >
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-6">
              <Zap className="w-3 h-3 mr-1" />
              Audit + Studio in un unico motore
            </Badge>
          </motion.div>

          {/* Title — split letter-stagger effect */}
          <motion.h1
            className="text-5xl md:text-7xl font-black tracking-tighter mb-6 overflow-hidden"
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
              ENGINE
            </motion.span>
          </motion.h1>

          {/* CTA Button — scale up with glow pulse */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ ...spring, delay: 0.7 }}
          >
            <Button
              variant="neon"
              size="lg"
              className="text-lg px-12 py-6 h-auto group animate-pulse-glow mb-6"
              onClick={() => navigate("/engine")}
            >
              Avvia SafeVin Engine
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          {/* Description — slide up with fade */}
          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-4 leading-relaxed"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            Analizza il tuo annuncio, ricevi score e criticità.<br />
            Correggi tutto e genera la versione migliore.
          </motion.p>

          {/* Pipeline steps — stagger from left */}
          <motion.div
            className="flex items-center justify-center gap-3 text-sm text-muted-foreground mb-10"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1, delayChildren: 1.0 } },
            }}
          >
            {[
              { icon: <Search className="w-3.5 h-3.5 text-primary" />, label: "Audit" },
              { icon: null, label: "→", className: "text-border" },
              { icon: null, label: "Fix", className: "text-foreground font-medium" },
              { icon: null, label: "→", className: "text-border" },
              { icon: <PenTool className="w-3.5 h-3.5 text-primary" />, label: "Studio" },
            ].map((item, i) => (
              <motion.span
                key={i}
                className={`flex items-center gap-1.5 ${item.className || ""}`}
                variants={{
                  hidden: { opacity: 0, x: -30 },
                  visible: { opacity: 1, x: 0 },
                }}
                transition={{ ...snappy }}
              >
                {item.icon}
                {item.label}
              </motion.span>
            ))}
          </motion.div>

          {/* Audit & Studio CTA buttons */}
          <motion.div
            className="flex items-center justify-center gap-4 mt-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 1.15 }}
          >
            <Button
              variant="outline"
              size="lg"
              className="h-auto py-4 px-8 border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all group"
              onClick={() => navigate("/about/audit")}
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4.5 h-4.5 text-primary" />
                <div className="text-left">
                  <span className="text-xs text-muted-foreground block leading-none mb-0.5">
                    SAFE<span className="text-primary">ViN</span>
                  </span>
                  <span className="font-bold text-foreground text-sm">Audit</span>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-auto py-4 px-8 border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all group"
              onClick={() => navigate("/about/studio")}
            >
              <div className="flex items-center gap-2.5">
                <PenTool className="w-4.5 h-4.5 text-primary" />
                <div className="text-left">
                  <span className="text-xs text-muted-foreground block leading-none mb-0.5">
                    SAFE<span className="text-primary">ViN</span>
                  </span>
                  <span className="font-bold text-foreground text-sm">Studio</span>
                </div>
              </div>
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default SafevinDashboard;
