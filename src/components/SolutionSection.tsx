import { Zap, Camera, PenTool, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const SolutionSection = () => {
  const headerRef = useScrollReveal({ direction: "up", duration: 0.7 });
  const studioRef = useScrollReveal({ direction: "up", delay: 0.15, duration: 0.8 });

  return (
    <section className="relative py-14 sm:py-20 md:py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-5 sm:px-6 max-w-5xl">
        <div ref={headerRef} className="text-center mb-8 sm:mb-10 md:mb-14">
          <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-foreground mb-2.5 sm:mb-3 md:mb-4">
            L'ecosistema <span className="text-primary">SAFEViN</span>
          </h2>
          <p className="text-muted-foreground text-[13px] sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
            Strumenti AI per creare annunci che vendono, con il supporto di un coach dedicato.
          </p>
        </div>

        <div ref={studioRef} className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <Card className="border-border/50 bg-card/50 hover:border-primary/30 transition-all duration-300 h-full">
            <CardContent className="p-5 sm:p-6 md:p-8 flex flex-col h-full">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                <PenTool className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">
                SAFEViN Studio
              </h3>
              <p className="text-muted-foreground text-[13px] sm:text-sm leading-relaxed flex-1">
                Costruzione strategica dell'annuncio da zero. Attraverso domande guidate e Vision AI, genera titoli ottimizzati, descrizioni persuasive e keyword intelligence calibrata sulla tua categoria.
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50 transition-all duration-300 h-full">
            <CardContent className="p-5 sm:p-6 md:p-8 flex flex-col h-full">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3 sm:mb-4">
                <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">
                SAFEViN Art Director
              </h3>
              <p className="text-muted-foreground text-[13px] sm:text-sm leading-relaxed flex-1">
                Affida le campagne visive dei tuoi articoli in vendita a SAFEViN: analizza ogni foto per garantire coerenza visiva e qualità, così il tuo annuncio comunica professionalità e attira più acquirenti.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:border-primary/30 transition-all duration-300 h-full">
            <CardContent className="p-5 sm:p-6 md:p-8 flex flex-col h-full">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">
                SAFEViN Coach
              </h3>
              <p className="text-muted-foreground text-[13px] sm:text-sm leading-relaxed flex-1">
                Il tuo esperto Vinted personale. Risposte rapide e pratiche su vendita, pricing, foto e strategia per vendere più veloce.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
