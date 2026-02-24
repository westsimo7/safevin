import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Sparkles, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  id: string;
  question: string;
  type: "text";
}

interface QuestionAnswer {
  question: string;
  answer: string;
}

interface DynamicQuestionsProps {
  categoria: string;
  visionReport: string | null;
  conversationHistory: QuestionAnswer[];
  onSubmit: (answers: QuestionAnswer[]) => void;
  onSkipToGenerate: () => void;
  missingAngles?: string[];
  onAddPhotos?: () => void;
}

const DynamicQuestions = ({
  categoria,
  visionReport,
  conversationHistory,
  onSubmit,
  onSkipToGenerate,
  missingAngles,
  onAddPhotos,
}: DynamicQuestionsProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("safelist-studio", {
        body: {
          action: "questions",
          categoria,
          visionReport,
          conversationHistory,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.complete) {
        onSkipToGenerate();
        return;
      }

      if (data?.questions) {
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error("Error loading questions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    const newAnswers: QuestionAnswer[] = questions
      .filter((q) => answers[q.id]?.trim())
      .map((q) => ({
        question: q.question,
        answer: answers[q.id],
      }));

    if (newAnswers.length === 0) return;
    onSubmit(newAnswers);
  };

  const someAnswered = questions.some((q) => answers[q.id]?.trim());

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-in">
        <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-muted-foreground text-sm">Preparo le domande...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          Raccontami del prodotto
        </h2>
        <p className="text-muted-foreground">
          Rispondi alle domande per creare un annuncio su misura.
        </p>
        {conversationHistory.length > 0 && (
          <p className="text-xs text-primary mt-2">
            {conversationHistory.length} risposte raccolte • Approfondimento in corso
          </p>
        )}
      </div>

      {/* ── Photo suggestion banner ── */}
      {missingAngles && missingAngles.length > 0 && onAddPhotos && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-2">
              📸 Per migliorare la qualità dell'annuncio, consiglierei di aggiungere:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 mb-3">
              {missingAngles.map((angle, i) => (
                <li key={i}>• Foto {angle}</li>
              ))}
            </ul>
            <Button variant="outline" size="sm" onClick={onAddPhotos}>
              <Camera className="w-3 h-3 mr-2" />
              Aggiungi altre foto
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Questions ── */}
      <div className="space-y-4">
        {questions.map((q, index) => (
          <Card
            key={q.id}
            className="border-border/50 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-4 space-y-3">
              <p className="font-medium text-sm">{q.question}</p>
              <Textarea
                placeholder="Scrivi qui la tua risposta..."
                value={answers[q.id] || ""}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                }
                className="min-h-[80px] resize-none"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Actions ── */}
      <div className="flex flex-col gap-3 pt-2">
        <Button
          variant="neon"
          size="lg"
          className="w-full group"
          onClick={handleSubmit}
          disabled={!someAnswered}
        >
          Prosegui
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>

        {conversationHistory.length > 0 && (
          <Button variant="glass" className="w-full" onClick={onSkipToGenerate}>
            <Sparkles className="w-4 h-4 mr-2" />
            Genera annuncio con le info raccolte
          </Button>
        )}
      </div>
    </div>
  );
};

export default DynamicQuestions;
