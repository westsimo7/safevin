import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, Sparkles, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ListingInputForm from "@/components/ListingInputForm";
import SmartLoader from "@/components/SmartLoader";
import EngineAnalysisCard from "@/components/EngineAnalysisCard";
import AnalysisSummary from "@/components/AnalysisSummary";

interface AnalysisSection {
  title: string;
  score: number;
  advice: string;
  impersonation?: string;
  scoreBreakdown?: string;
  conversionProbability?: number;
}

interface AnalysisResult {
  overallScore: number;
  sections: AnalysisSection[];
  summary?: string;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const EngineAudit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [lastSubmittedData, setLastSubmittedData] = useState<any>(null);

  const handleAnalyze = async (data: any) => {
    if (!data.titolo.trim() && !data.descrizione.trim() && data.images.length === 0) {
      toast({ title: "Dati insufficienti", description: "Inserisci almeno un titolo, una descrizione o delle foto.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const imageDataUrls: string[] = [];
      for (const file of data.images) {
        imageDataUrls.push(await fileToDataUrl(file));
      }

      const { data: responseData, error } = await supabase.functions.invoke("safelist-analyze", {
        body: {
          listing: {
            titolo: data.titolo, descrizione: data.descrizione, categoria: data.categoria,
            prezzo: data.prezzo, brand: data.brand, condizioni: data.condizioni,
            taglia: data.taglia, colore: data.colore, tempoCaricamento: data.tempoCaricamento,
          },
          images: imageDataUrls,
        },
      });

      if (error) throw error;

      if (responseData?.analysis) {
        const analysis = responseData.analysis;
        if (typeof analysis === "object" && Array.isArray(analysis.sections)) {
          setAnalysisResult(analysis);
          setLastSubmittedData(data);

          // Save to DB
          let firstImageUrl: string | null = null;
          if (data.images.length > 0) {
            const file = data.images[0];
            const fileName = `${Date.now()}-${file.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage.from("analysis-images").upload(fileName, file);
            if (!uploadError && uploadData) {
              const { data: urlData } = supabase.storage.from("analysis-images").getPublicUrl(uploadData.path);
              firstImageUrl = urlData.publicUrl;
            }
          }

          await supabase.from("analyses").insert([{
            titolo: data.titolo, descrizione: data.descrizione, categoria: data.categoria,
            prezzo: data.prezzo, brand: data.brand, condizioni: data.condizioni,
            taglia: data.taglia, colore: data.colore, tempo_caricamento: data.tempoCaricamento,
            first_image_url: firstImageUrl, analysis_result: analysis as any,
            analysis_type: "full",
          }]);
        }
      } else if (responseData?.error) {
        toast({ title: "Errore", description: responseData.error, variant: "destructive" });
      }
    } catch (err: any) {
      console.error("Audit error:", err);
      toast({ title: "Errore", description: err.message || "Riprova.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const getOverallScoreColor = (score: number) => {
    if (score >= 70) return "text-green-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  const totalScore = analysisResult?.sections?.reduce((sum, s) => sum + (s.score || 0), 0) ?? analysisResult?.overallScore ?? 0;

  const handleImprove = () => {
    navigate("/engine/improve", {
      state: {
        auditSections: analysisResult?.sections,
        listingData: lastSubmittedData,
        totalScore,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="container mx-auto px-6 pt-8 pb-12 max-w-4xl">
        <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground" onClick={() => navigate("/engine/analyze")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tipo analisi
        </Button>

        {!analysisResult && !isLoading && (
          <ListingInputForm onSubmit={handleAnalyze} isLoading={isLoading} />
        )}

        {isLoading && (
          <SmartLoader
            title="Analisi in corso..."
            messages={[
              "Connessione al motore di analisi…",
              "Valutazione qualità fotografica…",
              "Analisi struttura del titolo…",
              "Confronto posizionamento prezzo…",
              "Analisi leve psicologiche d'acquisto…",
              "Calcolo SafeScore™…",
              "Generazione report operativo…",
            ]}
          />
        )}

        {analysisResult && !isLoading && (
          <div className="space-y-6 animate-fade-in">
            {/* Score Header */}
            <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
              <CardContent className="py-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">SafeScore™ Globale</p>
                    <div className="flex items-center gap-4">
                      <span className={`text-6xl font-black ${getOverallScoreColor(totalScore)}`}>{totalScore}</span>
                      <span className="text-2xl text-muted-foreground">/100</span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      {totalScore >= 70 ? "Qualità elevata" : totalScore >= 40 ? "Margine di ottimizzazione" : "Intervento necessario"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Cards - Problem/Resolution only */}
            <div className="grid md:grid-cols-2 gap-4">
              {analysisResult.sections.map((section, index) => (
                <EngineAnalysisCard key={index} section={section} />
              ))}
            </div>

            {analysisResult.summary && <AnalysisSummary summary={analysisResult.summary} />}

            {/* CTA Migliora */}
            <Button
              variant="neon"
              size="lg"
              className="w-full group text-lg h-14"
              onClick={handleImprove}
            >
              <Wand2 className="w-5 h-5 mr-2" />
              Migliora il tuo annuncio
            </Button>

            <div className="flex flex-col gap-3">
              <Button variant="glass" className="w-full" onClick={() => { setAnalysisResult(null); setLastSubmittedData(null); }}>
                <Sparkles className="w-4 h-4 mr-2" />
                Nuovo Audit
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => navigate("/engine")}>
                Torna a Engine
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Sticky CTA - always visible when result exists */}
      {analysisResult && !isLoading && (
        <div className="fixed bottom-6 right-6 z-40 hidden sm:block">
          <Button
            variant="neon"
            size="lg"
            className="group shadow-lg shadow-primary/20"
            onClick={handleImprove}
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Migliora con Studio
          </Button>
        </div>
      )}

      {/* Mobile sticky bottom bar */}
      {analysisResult && !isLoading && (
        <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden p-3 bg-background/95 backdrop-blur border-t border-border/50">
          <Button
            variant="neon"
            size="lg"
            className="w-full group"
            onClick={handleImprove}
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Migliora con SafeViN Studio
          </Button>
        </div>
      )}
    </div>
  );
};

export default EngineAudit;
