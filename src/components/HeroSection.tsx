import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import FloatingResults from "@/components/FloatingResults";
import FloatingPercentages from "@/components/FloatingPercentages";

const spring = { type: "spring" as const, stiffness: 70, damping: 16 };

const HeroSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null!);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  // Parallax: logo moves up slower, subtitle faster
  const logoY = useTransform(smoothProgress, [0, 1], [0, -60]);
  const logoScale = useTransform(smoothProgress, [0, 0.5], [1, 0.9]);
  const logoOpacity = useTransform(smoothProgress, [0, 0.6], [1, 0]);
  const subtitleY = useTransform(smoothProgress, [0, 1], [0, -40]);
  const ctaY = useTransform(smoothProgress, [0, 1], [0, -20]);
  const ctaOpacity = useTransform(smoothProgress, [0, 0.5], [1, 0]);
  const descY = useTransform(smoothProgress, [0, 1], [0, 30]);
  const bgScale = useTransform(smoothProgress, [0, 1], [1, 1.15]);

  return (
    <section ref={sectionRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background pt-4 sm:pt-6">
      <FloatingPercentages />
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-background via-background to-card/30"
        style={{ scale: bgScale }}
      />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] sm:w-[800px] h-[300px] sm:h-[400px] bg-primary/5 rounded-full blur-[150px]" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center max-w-4xl">
        {/* LOGO */}
        <motion.div
          className="mb-3 sm:mb-6"
          initial={{ opacity: 0, rotateX: 50, y: 60, scale: 0.5 }}
          animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
          transition={{ ...spring, delay: 0.2, stiffness: 60 }}
          style={{ perspective: "800px", y: logoY, scale: logoScale, opacity: logoOpacity }}
        >
          <h1 className="text-[5.5rem] sm:text-8xl md:text-9xl lg:text-[10rem] font-black tracking-tighter leading-[0.85] select-none">
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
          className="text-base sm:text-xl md:text-2xl text-muted-foreground font-medium mb-5 sm:mb-8 tracking-tight leading-snug"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.5 }}
          style={{ y: subtitleY }}
        >
          Vendi su Vinted, più <strong className="text-foreground">veloce</strong>, <strong className="text-foreground">chiaro</strong> e al <strong className="text-foreground">prezzo giusto</strong>.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 justify-center px-1 sm:px-0 mb-5 sm:mb-8"
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...spring, delay: 0.65 }}
          style={{ y: ctaY, opacity: ctaOpacity }}
        >
          <Button variant="neon" size="lg" className="group w-full sm:w-auto cursor-not-allowed opacity-70 h-14 sm:h-14 text-base sm:text-lg px-8 sm:px-12" disabled>
            Prova gratis
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Link to="/home" className="w-full sm:w-auto">
            <Button variant="glass" size="lg" className="w-full sm:w-auto h-14 sm:h-14 text-base sm:text-lg px-8 sm:px-10">
              <LayoutDashboard className="mr-2 w-5 h-5" />
              Dashboard
            </Button>
          </Link>
        </motion.div>

        {/* Floating sold items */}
        <FloatingResults />

        {/* Description */}
        <motion.p
          className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed px-2 sm:px-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.85 }}
          style={{ y: descY }}
        >
          Creazione di Annunci ottimizzati in pochi minuti per aumentare la{" "}
          <strong className="text-foreground">probabilità statistica di vendita</strong>.
        </motion.p>
      </div>
    </section>
  );
};

export default HeroSection;
