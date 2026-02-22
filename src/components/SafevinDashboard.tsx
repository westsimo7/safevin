import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardHeader from "./DashboardHeader";
import ToolSelector from "./ToolSelector";
import AnalysisLoader from "./AnalysisLoader";
import AnalysisCard from "./AnalysisCard";
import AnalysisSummary from "./AnalysisSummary";
import ListingInputForm from "./ListingInputForm";
import StudioFlow from "./studio/StudioFlow";

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

const SafevinDashboard = () => {
  const [selectedTool, setSelectedTool] = useState<"post" | "pre" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [lastSubmittedData, setLastSubmittedData] = useState<any>(null);
  const { toast } = useToast();

  const handleAnalyze = async (data: {
    images: File[];
    titolo: string;
    descrizione: string;
    categoria: string;
    prezzo: string;
    brand: string;
    condizioni: string;
    taglia: string;
    colore: string;
    tempoCaricamento: string;
  }) => {
    if (!data.titolo.trim() && !data.descrizione.trim() && data.images.length === 0) {
      toast({
        title: "Dati insufficienti",
        description: "Inserisci almeno un titolo, una descrizione o delle foto per avviare l'analisi.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);

    try {
      // Convert images to base64 data URLs
      const imageDataUrls: string[] = [];
      for (const file of data.images) {
        const dataUrl = await fileToDataUrl(file);
        imageDataUrls.push(dataUrl);
      }

      const { data: responseData, error } = await supabase.functions.invoke("safelist-analyze", {
        body: {
          listing: {
            titolo: data.titolo,
            descrizione: data.descrizione,
            categoria: data.categoria,
            prezzo: data.prezzo,
            brand: data.brand,
            condizioni: data.condizioni,
            taglia: data.taglia,
            colore: data.colore,
            tempoCaricamento: data.tempoCaricamento,
          },
          images: imageDataUrls,
        },
      });

      if (error) {
        console.error("Function error:", error);
        toast({
          title: "Errore durante l'analisi",
          description: error.message || "Non è stato possibile completare l'analisi. Riprova.",
          variant: "destructive",
        });
        return;
      }

      if (responseData?.analysis) {
        const analysis = responseData.analysis;
        if (typeof analysis === "object" && Array.isArray(analysis.sections)) {
          setAnalysisResult(analysis);
          setLastSubmittedData(data);

          // Save to database in background
          saveAnalysis(data, analysis).catch((err) =>
            console.error("Failed to save analysis:", err)
          );
        } else {
          console.error("Invalid analysis format:", analysis);
          toast({
            title: "Formato non valido",
            description: "L'analisi non ha restituito un formato riconosciuto. Riprova.",
            variant: "destructive",
          });
        }
      } else if (responseData?.error) {
        toast({
          title: "Errore",
          description: responseData.error,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        title: "Errore imprevisto",
        description: "Qualcosa è andato storto. Riprova tra qualche istante.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedTool(null);
    setAnalysisResult(null);
    setLastSubmittedData(null);
  };

  const saveAnalysis = async (data: any, analysis: AnalysisResult) => {
    let firstImageUrl: string | null = null;

    // Upload first image to storage
    if (data.images.length > 0) {
      const file = data.images[0];
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("analysis-images")
        .upload(fileName, file);

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from("analysis-images")
          .getPublicUrl(uploadData.path);
        firstImageUrl = urlData.publicUrl;
      }
    }

    await supabase.from("analyses").insert([{
      titolo: data.titolo,
      descrizione: data.descrizione,
      categoria: data.categoria,
      prezzo: data.prezzo,
      brand: data.brand,
      condizioni: data.condizioni,
      taglia: data.taglia,
      colore: data.colore,
      tempo_caricamento: data.tempoCaricamento,
      first_image_url: firstImageUrl,
      analysis_result: analysis as any,
    }]);
  };

  const getOverallScoreColor = (score: number) => {
    if (score >= 70) return "text-green-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <DashboardHeader />
      
      <main className="container mx-auto px-6 pt-4 pb-4 flex-1 flex flex-col overflow-hidden">
        {selectedTool && (
          <Button 
            variant="ghost" 
            className="mb-6 text-muted-foreground hover:text-foreground flex-shrink-0"
            onClick={handleBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alla Dashboard
          </Button>
        )}
        {!selectedTool && (
          <div className="text-center mb-8">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Ecosistema AI per Marketplace
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Analisi strutturale.
              <br />
              <span className="text-primary">Risultati misurabili.</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Scegli lo strumento, inserisci i dati del tuo annuncio 
              e ricevi il tuo SafeScore™ con le correzioni operative.
            </p>
            <ToolSelector onSelectTool={setSelectedTool} selectedTool={selectedTool} />
          </div>
        )}

        {selectedTool === "pre" && (
          <StudioFlow onBack={handleBack} />
        )}

        {selectedTool === "post" && (
          <div className="max-w-4xl mx-auto">

            {!analysisResult && !isLoading && (
              <ListingInputForm onSubmit={handleAnalyze} isLoading={isLoading} />
            )}

            {isLoading && (
              <Card className="border-border/50">
                <AnalysisLoader isLoading={isLoading} />
              </Card>
            )}

            {analysisResult && !isLoading && (
              <div className="space-y-8">
                <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
                  <CardContent className="py-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">SafeScore™ Globale</p>
                        <div className="flex items-center gap-4">
                          <span className={`text-6xl font-black ${getOverallScoreColor(analysisResult.overallScore)}`}>
                            {analysisResult.overallScore}
                          </span>
                          <span className="text-2xl text-muted-foreground">/100</span>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                          {analysisResult.overallScore >= 70 
                            ? "Qualità elevata" 
                            : analysisResult.overallScore >= 40 
                            ? "Margine di ottimizzazione"
                            : "Intervento necessario"
                          }
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-4">
                  {analysisResult.sections.map((section, index) => (
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

                {analysisResult.summary && (
                  <AnalysisSummary summary={analysisResult.summary} />
                )}

                <div className="text-center pt-8">
                  <Button variant="glass" onClick={handleBack}>
                    Avvia un nuovo Audit
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default SafevinDashboard;
