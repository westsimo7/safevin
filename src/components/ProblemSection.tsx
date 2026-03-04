import { AlertTriangle, MessageSquare, RefreshCw, Clock, Users, Smartphone, Copy, Send } from "lucide-react";
import { useScrollReveal, useStaggerReveal } from "@/hooks/useScrollReveal";

const problems = [
  { icon: RefreshCw, text: "Titoli generici che non intercettano le ricerche giuste" },
  { icon: MessageSquare, text: "Descrizioni vaghe che non rispondono ai dubbi dell'acquirente" },
  { icon: Copy, text: "Foto che non comunicano valore né generano fiducia" },
  { icon: Clock, text: "Prezzi posizionati male rispetto al mercato reale" },
  { icon: Users, text: "Profili che non trasmettono affidabilità e professionalità" },
  { icon: Smartphone, text: "Annunci non ottimizzati per la visualizzazione mobile" },
  { icon: Send, text: "Errori strutturali invisibili che riducono visibilità e conversione" },
];

const ProblemSection = () => {
  const headerRef = useScrollReveal({ direction: "left", duration: 0.7 });
  const gridRef = useStaggerReveal({ direction: "up", stagger: 0.08, distance: 30 });
  const closingRef = useScrollReveal({ direction: "up", delay: 0.2, duration: 0.8 });

  return (
    <section className="relative py-24 bg-card/30 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Section header */}
        <div ref={headerRef} className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Il tuo annuncio sta vendendo meno di quanto potrebbe
          </h2>
        </div>
        
        {/* Problem list */}
        <div ref={gridRef} className="grid md:grid-cols-2 gap-4 mb-10">
          {problems.map((problem, index) => (
            <div
              key={index}
              data-reveal
              className="flex items-start gap-3 p-4 rounded-xl bg-background/50 border border-border/50 hover:border-destructive/30 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-destructive/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                <problem.icon className="w-4 h-4 text-destructive/70" />
              </div>
              <span className="text-foreground/80 text-sm leading-relaxed">{problem.text}</span>
            </div>
          ))}
        </div>
        
        {/* Closing statement */}
        <div ref={closingRef} className="p-6 rounded-2xl bg-background border border-border">
          <p className="text-lg text-foreground font-medium text-center">
            Ogni dettaglio trascurato è <span className="text-destructive">una vendita persa.</span>
          </p>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
};

export default ProblemSection;
