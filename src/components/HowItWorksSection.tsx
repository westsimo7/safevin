import { Upload, PenTool, FileText, Copy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useScrollTrigger, useScrollScale } from "@/hooks/useScrollTrigger";

const steps = [
  { icon: Upload, number: "01", title: "Carica le foto", description: "Carica le foto del prodotto e verranno estrapolate le informazioni base e i dettagli per velocizzare la creazione dell'annuncio." },
  { icon: PenTool, number: "02", title: "Aggiungi le info chiave", description: "Solo tu conosci i dettagli fondamentali: rispondi a poche domande per un annuncio iper-specifico e completo in pochi minuti." },
  { icon: Copy, number: "03", title: "Copia e pubblica", description: "Ricevi titolo, descrizione e prezzo strategico pronti per essere caricati direttamente su Vinted e velocizzare il processo." },
];

const features = [
  "Analisi intelligente delle immagini tramite l'Engine",
  "Valutazione sui 4 pilastri: qualità, luce, contrasto, completezza",
  "Domande mirate sui dettagli fondamentali del prodotto",
  "Raccolta dati precisa per un output perfettamente ottimizzato",
  "Generazione completa: titolo, descrizione e prezzo strategico",
  "Copy ottimizzato per aumentare visibilità e conversione",
  "Output immediato, pronto da copiare e pubblicare",
  "Struttura professionale già strutturata per Vinted",
  "Storico creazioni sempre accessibile",
  "Tutti gli annunci salvati per confronto e miglioramento continuo",
];

const HowItWorksSection = () => {
  const stepsHeader = useScrollTrigger();
  const blocksHeader = useScrollTrigger();
  const featureCard = useScrollScale();

  return (
    <section className="relative py-14 sm:py-16 md:py-20 bg-card/20 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-5 sm:px-6 max-w-5xl">
        <motion.div
          ref={stepsHeader.ref}
          className="text-center mb-8 sm:mb-10 md:mb-14"
          style={{ opacity: stepsHeader.opacity, y: stepsHeader.y }}
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2.5 sm:mb-4">
            Come funziona
          </h2>
          <p className="text-muted-foreground text-[13px] sm:text-sm md:text-base">Tre step per annunci che vendono davvero.</p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-6 sm:gap-6 md:gap-8 mb-14 sm:mb-16 md:mb-20">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 60, rotateY: -15 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.7,
                delay: index * 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 sm:mb-5">
                <step.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-primary/60 tracking-widest uppercase">{step.number}</span>
              <h3 className="text-base sm:text-lg font-bold text-foreground mt-1 mb-1.5 sm:mb-2">{step.title}</h3>
              <p className="text-[13px] sm:text-sm text-muted-foreground leading-relaxed max-w-[260px] mx-auto">{step.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="border-t border-border/50 pt-10 sm:pt-12 md:pt-16">
          <motion.div
            ref={blocksHeader.ref}
            className="text-center mb-8 sm:mb-10 md:mb-12"
            style={{ opacity: blocksHeader.opacity, y: blocksHeader.y }}
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2.5 sm:mb-4">
              Non è opinione. <span className="text-primary">È statistica.</span>
            </h2>
            <p className="text-muted-foreground text-[13px] sm:text-sm md:text-base max-w-2xl mx-auto px-2 sm:px-0">
              Ogni dettaglio non trascurato, è una possibilità in più di vendita.
            </p>
          </motion.div>

          <motion.div
            ref={featureCard.ref}
            style={{ scale: featureCard.scale, opacity: featureCard.opacity }}
          >
            <Card className="border-border/50 bg-card/50 hover:border-primary/30 transition-colors max-w-2xl mx-auto">
              <CardContent className="p-4 sm:p-5 md:p-6">
                <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground">SAFEViN Studio</h3>
                </div>
                <ul className="space-y-2 sm:space-y-2.5">
                  {features.map((item, j) => (
                    <motion.li
                      key={j}
                      className="flex items-start gap-2 sm:gap-2.5 text-[13px] sm:text-sm text-foreground/80"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: j * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <span className="text-primary mt-0.5 text-[10px] sm:text-xs">▸</span>
                      <span className="leading-relaxed">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
};

export default HowItWorksSection;
