import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, LayoutDashboard, PenTool, Camera, Zap, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { motion } from "framer-motion";
import { Trans, useTranslation } from "react-i18next";
import FloatingResults from "@/components/FloatingResults";
import FloatingPercentages from "@/components/FloatingPercentages";
import { ReviewsStats } from "@/components/ReviewsSection";



const spring = { type: "spring" as const, stiffness: 70, damping: 16 };

const HeroSection = () => {
  const descRef = useScrollReveal({ direction: "up", delay: 0.3, duration: 0.8 });
  const cardRef = useScrollReveal({ direction: "up", delay: 0.6, duration: 0.9, distance: 80 });
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleProvaGratis = () => {
    navigate("/auth");
  };

  return (
    <>
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background pt-4 sm:pt-6">
      <FloatingPercentages />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card/30" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] sm:w-[800px] h-[300px] sm:h-[400px] bg-primary/5 rounded-full blur-[150px]" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center max-w-4xl">
        {/* Badge */}

        {/* LOGO */}
        <motion.div
          className="mb-3 sm:mb-6"
          initial={{ opacity: 0, rotateX: 50, y: 60, scale: 0.5 }}
          animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
          transition={{ ...spring, delay: 0.2, stiffness: 60 }}
          style={{ perspective: "800px" }}
        >
          <motion.h1
            className="text-[5.5rem] sm:text-8xl md:text-9xl lg:text-[10rem] font-black tracking-tighter leading-[0.85] select-none"
            animate={{ y: [0, -6, 0], rotateX: [0, 2, 0], rotateY: [-1.5, 1.5, -1.5] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
          >
            <span
              className="text-foreground inline-block"
              style={{
                textShadow:
                  "0 2px 0 hsl(200 10% 20%), 0 4px 0 hsl(200 10% 16%), 0 6px 0 hsl(200 10% 12%), 0 10px 18px hsl(0 0% 0% / 0.45)",
              }}
            >
              SAFE
            </span>
            <motion.span
              className="text-primary inline-block"
              style={{
                textShadow:
                  "0 2px 0 hsl(174 65% 24%), 0 4px 0 hsl(174 65% 18%), 0 6px 0 hsl(174 65% 12%), 0 10px 18px hsl(174 65% 10% / 0.5)",
              }}
              animate={{
                textShadow: [
                  "0 2px 0 hsl(174 65% 24%), 0 4px 0 hsl(174 65% 18%), 0 6px 0 hsl(174 65% 12%), 0 10px 18px hsl(174 65% 10% / 0.5)",
                  "0 2px 0 hsl(174 65% 24%), 0 4px 0 hsl(174 65% 18%), 0 6px 0 hsl(174 65% 12%), 0 10px 28px hsl(174 65% 34% / 0.8)",
                  "0 2px 0 hsl(174 65% 24%), 0 4px 0 hsl(174 65% 18%), 0 6px 0 hsl(174 65% 12%), 0 10px 18px hsl(174 65% 10% / 0.5)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              ViN
            </motion.span>
          </motion.h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="text-base sm:text-xl md:text-2xl text-muted-foreground font-medium mb-5 sm:mb-8 tracking-tight leading-snug"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.5 }}
        >
          <Trans
            i18nKey="hero.subtitle"
            components={{
              1: <strong className="text-foreground" />,
              2: <strong className="text-foreground" />,
              3: <strong className="text-orange-500" />,
              4: <strong className="text-foreground" />,
            }}
          />
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 justify-center px-1 sm:px-0 mb-5 sm:mb-8"
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...spring, delay: 0.65 }}
        >
          <Button
            variant="neon"
            size="lg"
            className="group w-full sm:w-auto h-14 sm:h-14 text-base sm:text-lg px-8 sm:px-12"
            onClick={handleProvaGratis}
          >
            {t("hero.tryFree")}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Link to="/home" className="w-full sm:w-auto">
            <Button variant="glass" size="lg" className="w-full sm:w-auto h-14 sm:h-14 text-base sm:text-lg px-8 sm:px-10">
              <LayoutDashboard className="mr-2 w-5 h-5" />
              {t("hero.dashboard")}
            </Button>
          </Link>
        </motion.div>

        {/* Floating sold items */}
        <FloatingResults />

        {/* Stats numbers */}
        <div className="mt-6 sm:mt-10 max-w-3xl mx-auto text-center">
          <h2 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight mb-2 sm:mb-3">
            La web app che <span className="text-primary">velocizza le tue vendite</span> e migliora i tuoi annunci
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wider mb-5 sm:mb-7">
            La voce di chi vende
          </p>
          <ReviewsStats />
        </div>

        {/* Vedi recensioni button */}
        <motion.div
          className="mt-6 sm:mt-10 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <Button
            variant="glass"
            size="lg"
            className="h-12 sm:h-12 px-7 text-sm sm:text-base"
            onClick={() => {
              document.getElementById("recensioni")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            <Star className="mr-2 w-4 h-4 fill-primary text-primary" />
            Vedi recensioni
          </Button>
        </motion.div>

      </div>
      </section>
    </>
  );
};

export default HeroSection;
