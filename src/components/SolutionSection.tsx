import { Eye, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const SolutionSection = () => {
  const headerRef = useScrollReveal({ direction: "up", duration: 0.7 });
  const auditRef = useScrollReveal({ direction: "left", delay: 0.15, duration: 0.8 });
  const studioRef = useScrollReveal({ direction: "right", delay: 0.3, duration: 0.8 });

  return (
    <section className="relative py-14 sm:py-20 md:py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-5 sm:px-6 max-w-5xl">
        <div ref={headerRef} className="text-center mb-8 sm:mb-10 md:mb-14">
          <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-foreground mb-2.5 sm:mb-3 md:mb-4">
            L'ecosistema <span className="text-primary">SAFEViN</span>
          </h2>
          <p className="text-muted-foreground text-[13px] sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
            Due strumenti AI complementari per analizzare e costruire annunci che vendono.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {/* Audit Card */}
          <Card ref={auditRef} className="border-border/50 bg-card/50 hover:border-primary/30 transition-all duration-300 h-full">
            <CardContent className="p-5 sm:p-6 md:p-8 flex flex-col h-full">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">
                SAFEViN Audit
              </h3>
              <p className="text-muted-foreground text-[13px] sm:text-sm leading-relaxed flex-1">
                Analisi strutturale completa di annunci già pubblicati su 10 categorie. 
                Include il <strong className="text-foreground">SafeScore™</strong>, la metrica proprietaria 
                che quantifica la qualità del tuo annuncio in modo proporzionale ai dati forniti — non un'opinione, 
                ma un dato su cui agire. Ogni problema rilevato include una <strong className="text-foreground">correzione operativa</strong> concreta: 
                sai esattamente cosa cambiare, perché e quale impatto avrà sulle vendite.
              </p>
            </CardContent>
          </Card>

          {/* Studio Card */}
          <Card ref={studioRef} className="border-border/50 bg-card/50 hover:border-primary/30 transition-all duration-300 h-full">
            <CardContent className="p-5 sm:p-6 md:p-8 flex flex-col h-full">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">
                SAFEViN Studio
              </h3>
              <p className="text-muted-foreground text-[13px] sm:text-sm leading-relaxed flex-1">
                Costruzione strategica dell'annuncio da zero. Attraverso domande guidate e analisi delle foto 
                con Vision AI, Studio genera titoli ottimizzati, descrizioni persuasive e keyword intelligence 
                calibrata sulla tua categoria. L'output è pronto per essere pubblicato direttamente sul marketplace, 
                con struttura professionale e contenuto pensato per massimizzare visibilità e conversioni.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
