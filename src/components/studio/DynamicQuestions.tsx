import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Sparkles, MessageSquare } from "lucide-react";
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
}

const DynamicQuestions = ({
  categoria,
  visionReport,
  conversationHistory,
  onSubmit,
  onSkipToGenerate,
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

  const handleOptionSelect = (questionId: string, option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: prev[questionId] === option ? "" : option,
    }));
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

  const allAnswered = questions.every((q) => answers[q.id]?.trim());
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

      <div className="space-y-4">
        {questions.map((q, index) => (
          <Card key={q.id} className="border-border/50 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            <CardContent className="p-4 space-y-3">
              <p className="font-medium text-sm">{q.question}</p>

              {q.type === "options" && q.options ? (
                <div className="flex flex-wrap gap-2">
                  {q.options.map((opt) => (
                    <button
                      key={opt}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all active:scale-95 ${
                        answers[q.id] === opt
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border/50 text-foreground hover:border-primary/50"
                      }`}
                      onClick={() => handleOptionSelect(q.id, opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <Textarea
                  placeholder="Scrivi qui la tua risposta..."
                  value={answers[q.id] || ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                  className="min-h-[80px] resize-none"
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

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
          <Button
            variant="glass"
            className="w-full"
            onClick={onSkipToGenerate}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Genera annuncio con le info raccolte
          </Button>
        )}
      </div>
    </div>
  );
};

export default DynamicQuestions;
