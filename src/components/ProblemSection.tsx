import { AlertTriangle, MessageSquare, RefreshCw, Clock, Users, Smartphone, Copy, Send } from "lucide-react";

const problems = [
  {
    icon: RefreshCw,
    text: "Azioni ripetitive non evidenti",
  },
  {
    icon: MessageSquare,
    text: "Pattern di messaggistica sospetti",
  },
  {
    icon: Copy,
    text: "Gestione errata di annunci simili",
  },
  {
    icon: Clock,
    text: "Tempi di risposta incoerenti",
  },
  {
    icon: Users,
    text: "Segnalazioni indirette da altri utenti",
  },
  {
    icon: Smartphone,
    text: "Uso scorretto di dispositivi / IP",
  },
  {
    icon: Send,
    text: "Comportamenti \"normali\" che non lo sono per l'algoritmo",
  },
];

const ProblemSection = () => {
  return (
    <section className="relative py-24 bg-card/30 overflow-hidden">
      {/* Subtle border top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Perché gli account Vinted vengono bloccati senza preavviso
          </h2>
        </div>
        
        {/* Problem list */}
        <div className="grid md:grid-cols-2 gap-4 mb-10">
          {problems.map((problem, index) => (
            <div
              key={index}
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
        <div className="p-6 rounded-2xl bg-background border border-border">
          <p className="text-lg text-foreground font-medium text-center">
            La maggior parte dei venditori viene bloccata <span className="text-destructive">senza sapere perché.</span>
          </p>
        </div>
      </div>
      
      {/* Subtle border bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
};

export default ProblemSection;
