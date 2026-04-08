import AppNavbar from "@/components/AppNavbar";
import PageTitle from "@/components/PageTitle";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { Button } from "@/components/ui/button";
import { Search, CheckCircle, BarChart3, Image, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const features = [
  {
    icon: <FileText className="w-5 h-5" />,
    title: "Analisi completa annuncio",
    desc: "10 categorie analizzate: titolo, descrizione, prezzo, foto, coerenza, keyword e molto altro.",
  },
  {
    icon: <Image className="w-5 h-5" />,
    title: "Analisi immagini",
    desc: "Valutazione qualità, sfondo, illuminazione e composizione di ogni foto del tuo annuncio.",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "SafeScore™",
    desc: "Un punteggio da 0 a 100 che sintetizza la qualità complessiva del tuo annuncio.",
  },
  {
    icon: <CheckCircle className="w-5 h-5" />,
    title: "Criticità & suggerimenti",
    desc: "Ogni problema viene evidenziato con suggerimenti pratici per correggerlo subito.",
  },
];

const spring = { type: "spring" as const, stiffness: 100, damping: 18 };

const AboutAudit = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="container mx-auto px-6 py-12 max-w-3xl">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.1 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Search className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                <span className="text-foreground">SAFE</span>
                <span className="text-primary">ViN</span>
                <span className="text-foreground"> Audit</span>
              </h1>
            </div>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Il motore di analisi che scansiona ogni dettaglio del tuo annuncio e ti restituisce un report completo con punteggio, criticità e azioni correttive.
          </p>
        </motion.div>

        <div className="grid gap-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.2 + i * 0.1 }}
              className="flex items-start gap-4 p-5 rounded-xl border border-border/50 bg-card/50"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
                {f.icon}
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.6 }}
        >
          <Button
            variant="neon"
            size="lg"
            className="text-lg px-10 py-5 h-auto"
            onClick={() => navigate("/engine/analyze")}
          >
            Avvia Audit
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

export default AboutAudit;
