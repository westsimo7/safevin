import AppNavbar from "@/components/AppNavbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PenTool, Camera, Sparkles, Layout, Tags } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const features = [
  {
    icon: <Camera className="w-5 h-5" />,
    title: "Upload & Vision AI",
    desc: "Carica le foto del tuo prodotto e l'AI analizza automaticamente materiali, condizioni e dettagli.",
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "Domande intelligenti",
    desc: "Rispondi a poche domande mirate generate dall'AI per creare un annuncio perfetto.",
  },
  {
    icon: <Layout className="w-5 h-5" />,
    title: "Generazione completa",
    desc: "Titolo ottimizzato, descrizione professionale e struttura SEO-ready generati automaticamente.",
  },
  {
    icon: <Tags className="w-5 h-5" />,
    title: "Keyword intelligence",
    desc: "Suggerimenti di keyword strategiche per massimizzare la visibilità del tuo annuncio.",
  },
];

const spring = { type: "spring" as const, stiffness: 100, damping: 18 };

const AboutStudio = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="container mx-auto px-6 py-12 max-w-3xl">
        <motion.button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Torna alla Dashboard
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.1 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <PenTool className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                <span className="text-foreground">SAFE</span>
                <span className="text-primary">ViN</span>
                <span className="text-foreground"> Studio</span>
              </h1>
            </div>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Il motore creativo che genera annunci professionali partendo dalle tue foto. Upload, rispondi, pubblica.
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
            onClick={() => navigate("/engine/studio")}
          >
            Avvia Studio
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

export default AboutStudio;
