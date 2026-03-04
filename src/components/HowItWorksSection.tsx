import { Upload, BarChart3, PenTool, Eye, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    icon: Upload,
    number: "01",
    title: "Carica o incolla",
    description: "Carica le foto del tuo prodotto o incolla i dati del tuo annuncio esistente.",
  },
  {
    icon: BarChart3,
    number: "02",
    title: "Ottieni audit + score",
    description: "L'IA analizza ogni aspetto e ti restituisce un SafeScore™ con checklist operativa.",
  },
  {
    icon: PenTool,
    number: "03",
    title: "Migliora con Studio",
    description: "Rispondi a domande guidate e genera un annuncio ottimizzato. Salva tutto nello storico.",
  },
];

const blocks = [
  {
    icon: Eye,
    title: "SAFEViN Audit",
    items: [
      "Verifica struttura della descrizione e completezza informativa",
      "Coerenza tra immagini, titolo e contenuto dell'annuncio",
      "Ottimizzazione keyword e visibilità nelle ricerche",
      "Rilevamento errori invisibili che riducono visibilità e conversione",
      "SafeScore™ proporzionale: il cap massimo dipende dai dati forniti",
      "Punteggio calcolato su parametri oggettivi verificabili, non opinioni",
      "Vision AI analizza ogni foto: difetti, illuminazione, composizione e sfondo",
      "Score per foto: ogni immagine vale massimo 10 punti",
    ],
  },
  {
    icon: FileText,
    title: "SAFEViN Studio",
    items: [
      "Creazione annuncio guidata passo-passo con domande strutturate",
      "Domande dinamiche adattate al prodotto identificato dalla Vision",
      "Ottimizzazione premium con keyword intelligence integrata",
      "Output completo pronto per il marketplace (titolo, descrizione, keyword)",
      "Generazione titoli ottimizzati e descrizioni persuasive",
      "Analisi foto con Vision AI per contesto e coerenza categoria",
      "Struttura professionale calibrata per massimizzare visibilità",
      "Salvataggio nello storico per confronto e iterazione continua",
    ],
  },
];

const HowItWorksSection = () => {
  return (
    <section className="relative py-20 bg-card/20 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-6 max-w-5xl">
        {/* 3 steps */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Come funziona
          </h2>
          <p className="text-muted-foreground">Tre step per annunci che vendono davvero.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
                <step.icon className="w-7 h-7 text-primary" />
              </div>
              <span className="text-xs font-bold text-primary/60 tracking-widest uppercase">{step.number}</span>
              <h3 className="text-lg font-bold text-foreground mt-1 mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Deep explanation blocks */}
        <div className="border-t border-border/50 pt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Non opinioni. <span className="text-primary">Dati e metodo.</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ecco nel dettaglio cosa fa ogni componente dell'ecosistema SAFEViN.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {blocks.map((block, index) => (
              <Card key={index} className="border-border/50 bg-card/50 hover:border-primary/30 transition-colors h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <block.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{block.title}</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {block.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm text-foreground/80">
                        <span className="text-primary mt-0.5 text-xs">▸</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
};

export default HowItWorksSection;
