import { motion } from "framer-motion";
import { ArrowRight, X, Check } from "lucide-react";
import beforeImg from "@/assets/before-safevin.jpeg";
import afterImg from "@/assets/after-safevin.jpeg";

const BeforeAfterSection = () => {
  return (
    <section className="relative py-12 sm:py-20 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/20 to-transparent" />
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Il prima e dopo
          </p>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Da annuncio anonimo a <span className="text-primary">annuncio che vende</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-6 items-stretch relative">
          {/* BEFORE */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col"
          >
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-destructive/15 flex items-center justify-center border border-destructive/30">
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-destructive" />
              </div>
              <span className="text-sm sm:text-base font-bold uppercase tracking-wider text-destructive">
                Prima
              </span>
            </div>
            <div className="relative flex-1 rounded-2xl overflow-hidden border-2 border-destructive/25 bg-destructive/5 shadow-lg shadow-destructive/10">
              <img
                src={beforeImg}
                alt="Annuncio Vinted prima di SAFEviN"
                className="w-full h-full object-cover grayscale-[40%] opacity-90"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-destructive/20 via-transparent to-transparent pointer-events-none" />
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground text-center mt-2 sm:mt-3 leading-snug">
              Titolo generico, descrizione povera, prezzo basso
            </p>
          </motion.div>

          {/* Arrow divider */}
          <div className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 z-20 hidden sm:flex">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/40 border-2 border-background">
              <ArrowRight className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>

          {/* AFTER */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col"
          >
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary/15 flex items-center justify-center border border-primary/40">
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              </div>
              <span className="text-sm sm:text-base font-bold uppercase tracking-wider text-primary">
                Dopo
              </span>
            </div>
            <div className="relative flex-1 rounded-2xl overflow-hidden border-2 border-primary/40 bg-primary/5 shadow-2xl shadow-primary/25">
              <img
                src={afterImg}
                alt="Annuncio Vinted dopo SAFEviN"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/15 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-lg">
                SAFEviN
              </div>
            </div>
            <p className="text-[11px] sm:text-xs text-foreground/80 text-center mt-2 sm:mt-3 leading-snug font-medium">
              Titolo SEO, descrizione strutturata, prezzo strategico
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BeforeAfterSection;
