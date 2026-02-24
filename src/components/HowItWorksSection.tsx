import { Upload, BarChart3, PenTool } from "lucide-react";

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

const HowItWorksSection = () => {
  return (
    <section className="relative py-20 bg-card/20 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Come funziona
          </h2>
          <p className="text-muted-foreground">Tre step per annunci che vendono davvero.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
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
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
};

export default HowItWorksSection;
