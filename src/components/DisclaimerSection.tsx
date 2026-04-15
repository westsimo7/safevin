import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useScrollScale } from "@/hooks/useScrollTrigger";

const DisclaimerSection = () => {
  const anim = useScrollScale();

  return (
    <section className="py-8 sm:py-12 bg-background">
      <motion.div
        ref={anim.ref}
        className="container mx-auto px-5 sm:px-6 max-w-3xl"
        style={{ scale: anim.scale, opacity: anim.opacity }}
      >
        <div className="p-4 sm:p-6 rounded-2xl border border-border/50 bg-card/50">
          <div className="flex items-start gap-2.5 sm:gap-3">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1.5 sm:space-y-2">
              <p className="text-[13px] sm:text-sm font-semibold text-foreground">Disclaimer</p>
              <p className="text-[13px] sm:text-sm text-muted-foreground leading-relaxed">
                <strong>SafeViN è uno strumento indipendente: non collaboriamo con Vinted.</strong>
              </p>
              <p className="text-[13px] sm:text-sm text-muted-foreground leading-relaxed">
                Non garantiamo risultati certi: i risultati dipendono anche da prodotto, prezzo, domanda e qualità dell'offerta. SafeViN ti fornisce gli strumenti e l'analisi, ma il successo finale è influenzato da molti fattori di mercato.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default DisclaimerSection;
