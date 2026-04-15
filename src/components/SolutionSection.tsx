import { Camera, PenTool, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useScrollTrigger, useScrollScale } from "@/hooks/useScrollTrigger";

const SolutionSection = () => {
  const header = useScrollTrigger();
  const card1 = useScrollScale();
  const card2 = useScrollScale();
  const card3 = useScrollScale();
  const cardRefs = [card1, card2, card3];

  const cards = [
    {
      icon: PenTool,
      title: "SAFEViN Studio",
      desc: "Costruzione strategica dell'annuncio da zero. Attraverso domande guidate e Vision AI, genera titoli ottimizzati, descrizioni persuasive e keyword intelligence calibrata sulla tua categoria.",
      border: "border-border/50 bg-card/50 hover:border-primary/30",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      soon: false,
    },
    {
      icon: Camera,
      title: "SAFEViN Artist Director",
      desc: "Affida le campagne visive dei tuoi articoli in vendita a SAFEViN: analizza ogni foto per garantire coerenza visiva e qualità, così il tuo annuncio comunica professionalità e attira più acquirenti.",
      border: "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
      soon: false,
    },
    {
      icon: MessageCircle,
      title: "SAFEViN Coach",
      desc: "Ti supporta in modo attivo con domande mirate per aiutarti a risolvere ogni problema e raggiungere il tuo obiettivo di vendita. Ti guida su foto, titoli, descrizioni e strategie di vendita.",
      border: "border-border/50 bg-card/50 hover:border-primary/30",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      soon: true,
    },
  ];

  return (
    <section className="relative py-14 sm:py-20 md:py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-5 sm:px-6 max-w-5xl">
        <motion.div
          ref={header.ref}
          className="text-center mb-8 sm:mb-10 md:mb-14"
          style={{ opacity: header.opacity, y: header.y }}
        >
          <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-foreground mb-2.5 sm:mb-3 md:mb-4">
            <span className="text-primary">SAFEViN</span> Engine
          </h2>
          <p className="text-muted-foreground text-[13px] sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
            Strumenti AI per creare annunci che vendono, con il supporto di un coach dedicato.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              ref={cardRefs[i].ref}
              style={{ scale: cardRefs[i].scale, opacity: cardRefs[i].opacity }}
            >
              <Card className={`${card.border} transition-all duration-300 h-full ${card.soon ? "relative overflow-hidden" : ""}`}>
                {card.soon && (
                  <div className="absolute -right-8 top-4 rotate-45 bg-destructive text-destructive-foreground text-[10px] font-bold uppercase tracking-widest py-1 px-10 shadow-md whitespace-nowrap">
                    SOON
                  </div>
                )}
                <CardContent className="p-5 sm:p-6 md:p-8 flex flex-col h-full">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${card.iconBg} flex items-center justify-center mb-3 sm:mb-4`}>
                    <card.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${card.iconColor}`} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">
                    {card.title}
                  </h3>
                  <p className="text-muted-foreground text-[13px] sm:text-sm leading-relaxed flex-1">
                    {card.desc}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
