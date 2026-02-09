import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/DashboardHeader";
import AnalysisCard from "@/components/AnalysisCard";
import MobileAnalysisCard from "@/components/MobileAnalysisCard";
import AnalysisSummary from "@/components/AnalysisSummary";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, Image as ImageIcon } from "lucide-react";

interface AnalysisRecord {
  id: string;
  titolo: string;
  descrizione: string;
  categoria: string;
  prezzo: string;
  brand: string;
  condizioni: string;
  taglia: string;
  colore: string;
  tempo_caricamento: string;
  first_image_url: string | null;
  analysis_result: any;
  created_at: string;
}

const StoricoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [analysis, setAnalysis] = useState<AnalysisRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("analyses")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        setAnalysis(data as AnalysisRecord);
      }
      setLoading(false);
    };
    fetchAnalysis();
  }, [id]);

  const getOverallScoreColor = (score: number) => {
    if (score >= 70) return "text-green-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-6 py-12 text-center text-muted-foreground">
          Caricamento...
        </main>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-6 py-12 text-center">
          <p className="text-muted-foreground mb-4">Analisi non trovata.</p>
          <Button variant="ghost" onClick={() => navigate("/storico")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna allo storico
          </Button>
        </main>
      </div>
    );
  }

  const result = analysis.analysis_result;
  const fields = [
    { label: "Titolo", value: analysis.titolo },
    { label: "Descrizione", value: analysis.descrizione },
    { label: "Categoria", value: analysis.categoria },
    { label: "Prezzo", value: analysis.prezzo },
    { label: "Brand", value: analysis.brand },
    { label: "Condizioni", value: analysis.condizioni },
    { label: "Taglia", value: analysis.taglia },
    { label: "Colore", value: analysis.colore },
    { label: "Tempo caricamento", value: analysis.tempo_caricamento },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <Button
          variant="ghost"
          className="mb-6 text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/storico")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Torna allo storico
        </Button>

        {/* Original Input Data - Read Only */}
        <Card className="border-border/50 mb-8">
          <CardContent className="py-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              Dati dell'annuncio analizzato
            </h2>

            {analysis.first_image_url && (
              <div className="mb-4 rounded-lg overflow-hidden max-w-xs">
                <img
                  src={analysis.first_image_url}
                  alt={analysis.titolo || "Immagine annuncio"}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              {fields.map(
                (field) =>
                  field.value && (
                    <div key={field.label} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                      <p className="text-xs text-muted-foreground mb-1">{field.label}</p>
                      <p className="text-sm text-foreground whitespace-pre-line">{field.value}</p>
                    </div>
                  )
              )}
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Analizzato il{" "}
              {new Date(analysis.created_at).toLocaleDateString("it-IT", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {result && (
          <div className="space-y-8">
            <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
              <CardContent className="py-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Punteggio Globale</p>
                    <div className="flex items-center gap-4">
                      <span className={`text-6xl font-black ${getOverallScoreColor(result.overallScore)}`}>
                        {result.overallScore}
                      </span>
                      <span className="text-2xl text-muted-foreground">/100</span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      {result.overallScore >= 70
                        ? "Ottimo potenziale"
                        : result.overallScore >= 40
                        ? "Margine di miglioramento"
                        : "Necessita ottimizzazione"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isMobile ? (
              <div className="flex flex-col gap-3">
                {result.sections?.map((section: any, index: number) => (
                  <MobileAnalysisCard
                    key={index}
                    title={section.title}
                    score={section.score}
                    advice={section.advice}
                    impersonation={section.impersonation}
                    scoreBreakdown={section.scoreBreakdown}
                    conversionProbability={section.conversionProbability}
                  />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {result.sections?.map((section: any, index: number) => (
                  <AnalysisCard
                    key={index}
                    title={section.title}
                    score={section.score}
                    advice={section.advice}
                    impersonation={section.impersonation}
                    scoreBreakdown={section.scoreBreakdown}
                    conversionProbability={section.conversionProbability}
                  />
                ))}
              </div>
            )}

            {result.summary && <AnalysisSummary summary={result.summary} />}

            <div className="text-center pt-8">
              <Button variant="glass" onClick={() => navigate("/storico")}>
                Torna allo storico
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StoricoDetail;
