import { AlertTriangle, MessageSquare, RefreshCw, Clock, Users, Copy, Send } from "lucide-react";
import { motion } from "framer-motion";
import { useScrollTrigger, useScrollSlide } from "@/hooks/useScrollTrigger";

const problems = [
  { icon: Copy, text: "Foto non ottimizzate → non attirano né convincono" },
  { icon: RefreshCw, text: "Titolo troppo spoglio → nessuno lo trova" },
  { icon: MessageSquare, text: "Descrizione debole → non risponde ai dubbi" },
  { icon: Users, text: "Dettagli fondamentali mancanti → blocchi la fiducia" },
  { icon: Clock, text: "Prezzo non competitivo → niente click, niente offerte" },
  { icon: Send, text: "Non trasmette valore → l'utente scrolla oltre" },
];

const ProblemSection = () => {
  const header = useScrollSlide("left");
  const section = useScrollTrigger();
  const closing = useScrollSlide("right");

  return (
    <section className="relative py-14 sm:py-20 md:py-24 bg-card/30 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-5 sm:px-6 max-w-4xl">
        {/* Section header */}
        <motion.div
          ref={header.ref}
          className="flex items-start sm:items-center gap-3 mb-6 sm:mb-8"
          style={{ x: header.x, opacity: header.opacity }}
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">
            Il tuo annuncio sta vendendo meno di quanto potrebbe
          </h2>
        </motion.div>

        {/* Problem list */}
        <motion.div
          ref={section.ref}
          className="grid sm:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 mb-8 sm:mb-10"
          style={{ opacity: section.opacity, y: section.y, scale: section.scale }}
        >
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl bg-background/50 border border-border/50 hover:border-destructive/30 transition-colors"
              initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-destructive/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                <problem.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-destructive/70" />
              </div>
              <span className="text-foreground/80 text-[13px] sm:text-sm leading-relaxed">{problem.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Closing statement */}
        <motion.div
          ref={closing.ref}
          className="p-4 sm:p-6 rounded-2xl bg-background border border-border"
          style={{ x: closing.x, opacity: closing.opacity }}
        >
          <p className="text-base sm:text-lg text-foreground font-medium text-center">
            Ogni dettaglio trascurato è <span className="text-destructive">una vendita persa.</span>
          </p>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
};

export default ProblemSection;
