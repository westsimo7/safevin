import { BarChart3, Eye, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "Monitoraggio comportamentale",
    description: "Analizza pattern di utilizzo, frequenza azioni e segnali di rischio che l'algoritmo Vinted considera sospetti.",
  },
  {
    icon: BarChart3,
    title: "Risk Score in tempo reale",
    description: "Indicatore chiaro del livello di rischio del tuo account, con spiegazioni testuali concrete.",
  },
  {
    icon: Shield,
    title: "Suggerimenti operativi",
    description: "Azioni correttive immediate da eseguire per ridurre il rischio di limitazioni o ban.",
  },
  {
    icon: Zap,
    title: "Simulatore di rischio",
    description: "Scopri l'impatto delle tue azioni prima di farle. 'Se fai X → rischio aumenta di Y'.",
  },
];

const SolutionSection = () => {
  return (
    <section className="relative py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Safevin non indovina. <span className="text-primary">Analizza.</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Safevin monitora e interpreta il comportamento del tuo account rispetto a pattern di rischio noti, 
            errori frequenti e dinamiche che portano a limitazioni o ban.
          </p>
          <p className="text-foreground/80 mt-4 font-medium">
            Non promette risultati. Promette <span className="text-primary">consapevolezza e controllo.</span>
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
            ⚠️ Il SaaS Safevin è accessibile solo dalla dashboard account dopo il login.
          </p>
          <p className="text-foreground/80">
            Questo garantisce <strong>sicurezza</strong>, <strong>privacy</strong> e un'esperienza <strong>premium</strong>.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
