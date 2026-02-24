import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Wand2,
  MessageSquarePlus,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SmartLoader from "@/components/SmartLoader";
import StudioOutput from "@/components/studio/StudioOutput";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface GapQuestion {
  id: string;
  question: string;
  type: string;
}

type Phase = "choice" | "gap-loading" | "gap-questions" | "generating" | "output";

const EngineImprove = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { auditSections, listingData, totalScore } = (location.state || {}) as any;

  const [phase, setPhase] = useState<Phase>("choice");
  const [showWarning, setShowWarning] = useState(false);
  const [gapQuestions, setGapQuestions] = useState<GapQuestion[]>([]);
  const [gapAnswers, setGapAnswers] = useState<Record<string, string>>({});
  const [outputData, setOutputData] = useState<any>(null);

  useEffect(() => {
    if (!auditSections || !listingData) {
      toast({
        title: "Dati mancanti",
        description: "Torna all'audit per generare il miglioramento.",
        variant: "destructive",
      });
      navigate("/engine/analyze/audit");
    }
  }, []);

  const generateImproved = async (extraAnswers?: { question: string; answer: string }[]) => {
    setPhase("generating");
    try {
      const { data, error } = await supabase.functions.invoke("safelist-studio", {
        body: {
          action: "improve",
          auditSections,
          listingData: {
            titolo: listingData.titolo,
            descrizione: listingData.descrizione,
            categoria: listingData.categoria,
            prezzo: listingData.prezzo,
            brand: listingData.brand,
            condizioni: listingData.condizioni,
            taglia: listingData.taglia,
            colore: listingData.colore,
          },
          gapAnswers: extraAnswers || [],
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.output) {
        setOutputData(data.output);
        setPhase("output");
        await supabase.from("studio_creations").insert([
          {
            categoria: listingData.categoria || "Miglioramento",
            questions_answers: (extraAnswers || []) as any,
            output: data.output as any,
            titolo_generato: data.output.titolo,
          },
        ]);
      }
    } catch (err: any) {
      console.error("Improve error:", err);
      toast({
        title: "Errore",
        description: err.message || "Errore durante il miglioramento.",
        variant: "destructive",
      });
      setPhase("choice");
    }
  };

  const loadGapQuestions = async () => {
    setPhase("gap-loading");
    try {
      const { data, error } = await supabase.functions.invoke("safelist-studio", {
        body: {
          action: "gap_questions",
          auditSections,
          listingData,
          conversationHistory: [],
        },
      });

      if (error) throw error;
      if (data?.complete) {
        await generateImproved();
        return;
      }
      if (data?.questions) {
        setGapQuestions(data.questions);
        setPhase("gap-questions");
      }
    } catch (err: any) {
      toast({
        title: "Errore",
        description: err.message || "Errore caricamento domande.",
        variant: "destructive",
      });
      setPhase("choice");
    }
  };

  const submitGapAndGenerate = () => {
    const answers = gapQuestions
      .filter((q) => gapAnswers[q.id]?.trim())
      .map((q) => ({ question: q.question, answer: gapAnswers[q.id] }));
    generateImproved(answers);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-6 pt-8 pb-12 max-w-2xl">
        {phase !== "generating" && phase !== "output" && (
          <Button
            variant="ghost"
            className="mb-6 text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/engine/analyze/audit")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna all'Audit
          </Button>
        )}

        {/* ── CHOICE ── */}
        {phase === "choice" && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Miglioramento Annuncio</h1>
              <p className="text-muted-foreground">
                Vuoi procedere con o senza informazioni aggiuntive?
              </p>
            </div>

            <Card
              className="border-border/50 cursor-pointer hover:border-primary/50 transition-all"
              onClick={() => setShowWarning(true)}
            >
              <CardContent className="p-6 space-y-2">
                <div className="flex items-center gap-3">
                  <Wand2 className="w-6 h-6 text-primary" />
                  <h3 className="font-bold text-lg">Procedi con i dati attuali</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  L'annuncio verrà migliorato utilizzando solo le informazioni già presenti.
                </p>
              </CardContent>
            </Card>

            <Card
              className="border-primary/30 bg-primary/5 cursor-pointer hover:border-primary/50 transition-all"
              onClick={loadGapQuestions}
            >
              <CardContent className="p-6 space-y-2">
                <div className="flex items-center gap-3">
                  <MessageSquarePlus className="w-6 h-6 text-primary" />
                  <h3 className="font-bold text-lg">
                    Aggiungi dettagli mancanti per massimizzare il punteggio
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Rispondi ad alcune domande mirate per ottenere un annuncio più completo e
                  performante.
                </p>
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                  Consigliato per SafeScore 80+
                </Badge>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── WARNING DIALOG ── */}
        <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Attenzione
              </AlertDialogTitle>
              <AlertDialogDescription>
                Alcuni dettagli fondamentali (misure, composizione, specifiche tecniche) non
                sono presenti. L'ottimizzazione sarà limitata ai dati disponibili.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Torna indietro</AlertDialogCancel>
              <AlertDialogAction onClick={() => generateImproved()}>
                Procedi comunque
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ── GAP LOADING ── */}
        {phase === "gap-loading" && (
          <SmartLoader
            title="Analizzo i gap del tuo annuncio..."
            messages={[
              "Identifico le informazioni mancanti...",
              "Preparo domande mirate per il tuo caso...",
            ]}
          />
        )}

        {/* ── GAP QUESTIONS ── */}
        {phase === "gap-questions" && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Dettagli mancanti</h2>
              <p className="text-muted-foreground text-sm">
                Rispondi per massimizzare il SafeScore del tuo annuncio.
              </p>
            </div>

            <div className="space-y-4">
              {gapQuestions.map((q, i) => (
                <Card
                  key={q.id}
                  className="border-border/50 animate-fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <CardContent className="p-4 space-y-3">
                    <p className="font-medium text-sm">{q.question}</p>
                    <Textarea
                      placeholder="Scrivi qui la tua risposta..."
                      value={gapAnswers[q.id] || ""}
                      onChange={(e) =>
                        setGapAnswers((prev) => ({
                          ...prev,
                          [q.id]: e.target.value,
                        }))
                      }
                      className="min-h-[80px] resize-none"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              variant="neon"
              size="lg"
              className="w-full group"
              onClick={submitGapAndGenerate}
              disabled={!gapQuestions.some((q) => gapAnswers[q.id]?.trim())}
            >
              Genera annuncio migliorato
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}

        {/* ── GENERATING ── */}
        {phase === "generating" && <SmartLoader title="Miglioro il tuo annuncio..." />}

        {/* ── OUTPUT ── */}
        {phase === "output" && outputData && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-2">
              <Badge className="bg-green-500/10 text-green-500 border-green-500/30 mb-3">
                Ottimizzato da Audit + Studio
              </Badge>
            </div>
            <StudioOutput
              data={outputData}
              onNew={() => navigate("/engine")}
              onBack={() => navigate("/engine")}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default EngineImprove;
