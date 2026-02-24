import { BarChart3, Eye, Shield, Zap, Camera } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Eye,
    title: "SAFEViN Audit",
    description: "Analisi strutturale di annunci già pubblicati. 10 categorie, punteggio SafeScore™, problemi identificati e soluzioni operative immediate.",
  },
  {
    icon: BarChart3,
    title: "SafeScore™",
    description: "Metrica proprietaria che quantifica la qualità del tuo annuncio. Proporzionale ai dati forniti, non un'opinione: un dato su cui agire.",
  },
  {
    icon: Shield,
    title: "Correzioni operative",
    description: "Ogni problema rilevato include una soluzione concreta. Sai esattamente cosa cambiare, perché e quale impatto avrà.",
  },
  {
    icon: Camera,
    title: "Analisi Immagini",
    description: "Vision AI rileva difetti, qualità visiva, contesto e coerenza categoria. Score proporzionale al numero di foto analizzate.",
  },
  {
    icon: Zap,
    title: "SAFEViN Studio",
    description: "Costruzione strategica dell'annuncio con domande guidate, keyword intelligence e output pronto per il marketplace.",
  },
];

const SolutionSection = () => {
  return (
    <section className="relative py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            L'ecosistema <span className="text-primary">SAFEViN</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Strumenti AI che analizzano, correggono e costruiscono i tuoi annunci per massimizzare le vendite.
          </p>
        </div>

        {/* Carousel */}
        <Carousel
          opts={{ align: "start", loop: true }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {features.map((feature, index) => (
              <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <Card className="border-border/50 bg-card/50 hover:border-primary/30 transition-all duration-300 h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center gap-2 mt-6">
            <CarouselPrevious className="static translate-y-0" />
            <CarouselNext className="static translate-y-0" />
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default SolutionSection;
