import { BarChart3, Eye, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "SAFEViN Audit",
    description: "Analisi strutturale di annunci già pubblicati. 10 categorie, punteggio SafeScore™, problemi identificati e soluzioni operative immediate.",
  },
  {
    icon: BarChart3,
    title: "SafeScore™",
    description: "Metrica proprietaria su 10 categorie che quantifica la qualità del tuo annuncio. Non un'opinione: un dato su cui agire.",
  },
  {
    icon: Shield,
    title: "Correzioni operative",
    description: "Ogni problema rilevato include una soluzione concreta. Sai esattamente cosa cambiare, perché e quale impatto avrà.",
  },
  {
    icon: Zap,
    title: "SAFEViN Studio",
    description: "Costruzione strategica dell'annuncio prima della pubblicazione. Struttura, copy e posizionamento guidati dall'AI.",
  },
];

const SolutionSection = () => {
  return (
    <section className="relative py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Non opinioni. <span className="text-primary">Dati e metodo.</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            SAFEViN è un ecosistema AI che analizza la struttura dei tuoi annunci, 
            identifica i punti deboli e ti guida con azioni correttive precise.
          </p>
          <p className="text-foreground/80 mt-4 font-medium">
            Ogni annuncio ha margini di miglioramento. <span className="text-primary">SAFEViN li rende visibili.</span>
          </p>
        </div>
        
        {/* Feature grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* Dashboard preview hint */}
        <div className="mt-16 p-8 rounded-2xl bg-card/30 border border-border text-center">
          <p className="text-muted-foreground text-sm mb-2">
            ⚠️ Gli strumenti SAFEViN sono accessibili dalla dashboard dopo l'accesso.
          </p>
          <p className="text-foreground/80">
            Un ambiente riservato per garantire <strong>precisione</strong>, <strong>privacy</strong> e <strong>risultati professionali</strong>.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
