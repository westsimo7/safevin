import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowLeft, Sparkles, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardHeader from "./DashboardHeader";
import ToolSelector from "./ToolSelector";
import AnalysisLoader from "./AnalysisLoader";
import AnalysisCard from "./AnalysisCard";
import AlreadyAnalyzedDialog from "./AlreadyAnalyzedDialog";

interface AdvancedCheck {
  label: string;
  status: "ok" | "warning" | "error";
  detail: string;
}

interface AnalysisSection {
  title: string;
  score: number;
  advice: string;
  advancedChecks?: AdvancedCheck[];
  ultimateContent?: string;
}

interface AnalysisResult {
  overallScore: number;
  sections: AnalysisSection[];
}

const SafevinDashboard = () => {
  const [selectedTool, setSelectedTool] = useState<"post" | "pre" | null>(null);
  const [vintedUrl, setVintedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analyzedUrls, setAnalyzedUrls] = useState<Set<string>>(new Set());
  const [showAlreadyAnalyzedDialog, setShowAlreadyAnalyzedDialog] = useState(false);
  const { toast } = useToast();

  // Load analyzed URLs from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("safevin_analyzed_urls");
    if (stored) {
      setAnalyzedUrls(new Set(JSON.parse(stored)));
    }
  }, []);

  const isValidVintedUrl = (url: string): boolean => {
    return url.includes("vinted.") && url.includes("/items/");
  };

  const handleAnalyze = async () => {
    if (!vintedUrl.trim()) {
      toast({
        title: "Link mancante",
        description: "Inserisci il link del tuo annuncio Vinted.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidVintedUrl(vintedUrl)) {
      toast({
        title: "Link non valido",
        description: "Inserisci un link valido di un annuncio Vinted.",
        variant: "destructive",
      });
      return;
    }

    // Check if already analyzed
    if (analyzedUrls.has(vintedUrl)) {
      setShowAlreadyAnalyzedDialog(true);
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("safelist-analyze", {
        body: { 
          vintedUrl,
          analysisType: "post"
        },
      });

      if (error) {
        console.error("Function error:", error);
        toast({
          title: "Errore analisi",
          description: error.message || "Impossibile analizzare l'annuncio.",
          variant: "destructive",
        });
        return;
      }

      if (data?.analysis) {
        setAnalysisResult(data.analysis);
        
        // Save analyzed URL
        const newAnalyzedUrls = new Set(analyzedUrls);
        newAnalyzedUrls.add(vintedUrl);
        setAnalyzedUrls(newAnalyzedUrls);
        localStorage.setItem("safevin_analyzed_urls", JSON.stringify([...newAnalyzedUrls]));
      } else if (data?.error) {
        toast({
          title: "Errore",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        title: "Errore",
        description: "Si è verificato un errore imprevisto.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedTool(null);
    setAnalysisResult(null);
    setVintedUrl("");
  };

  const getOverallScoreColor = (score: number) => {
    if (score >= 70) return "text-green-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        {!selectedTool && (
          <div className="text-center mb-16">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-6">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered Analysis
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Trasforma i tuoi annunci Vinted
              <br />
              <span className="text-primary">in macchine di vendita</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
              SAFEVIN analizza titolo, foto, prezzo e fiducia del tuo annuncio 
              e ti dice esattamente cosa migliorare.
            </p>
            
            {/* Tool Selector */}
            <ToolSelector 
              onSelectTool={setSelectedTool} 
              selectedTool={selectedTool}
            />
          </div>
        )}

        {/* SAFEVIN POST Tool */}
        {selectedTool === "post" && (
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Button 
              variant="ghost" 
              className="mb-6 text-muted-foreground hover:text-foreground"
              onClick={handleBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna alla selezione
            </Button>

            {/* Input Section */}
            {!analysisResult && !isLoading && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-primary" />
                    Analizza il tuo annuncio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Link annuncio Vinted
                    </label>
                    <div className="flex gap-3">
                      <Input
                        value={vintedUrl}
                        onChange={(e) => setVintedUrl(e.target.value)}
                        placeholder="Incolla qui il link del tuo annuncio Vinted"
                        className="flex-1 bg-background border-border"
                      />
                      <Button 
                        variant="neon" 
                        onClick={handleAnalyze}
                        disabled={isLoading}
                      >
                        Avvia Analisi
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground/70 mt-2">
                      Esempio: https://www.vinted.it/items/1234567890
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Loading Animation */}
            {isLoading && (
              <Card className="border-border/50">
                <AnalysisLoader isLoading={isLoading} />
              </Card>
            )}

            {/* Results */}
            {analysisResult && !isLoading && (
              <div className="space-y-8">
                {/* Overall Score */}
                <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
                  <CardContent className="py-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Punteggio Globale</p>
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
                            ? "Ottimo potenziale" 
                            : analysisResult.overallScore >= 40 
                            ? "Margine di miglioramento"
                            : "Necessita ottimizzazione"
                          }
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Analysis Sections */}
                <div className="grid md:grid-cols-2 gap-4">
                  {analysisResult.sections.map((section, index) => (
                    <AnalysisCard
                      key={index}
                      title={section.title}
                      score={section.score}
                      advice={section.advice}
                      advancedChecks={section.advancedChecks}
                      ultimateContent={section.ultimateContent}
                      hasUltimate={false}
                    />
                  ))}
                </div>

                {/* New Analysis Button */}
                <div className="text-center pt-8">
                  <Button variant="glass" onClick={handleBack}>
                    Analizza un altro annuncio
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Already Analyzed Dialog */}
      <AlreadyAnalyzedDialog
        open={showAlreadyAnalyzedDialog}
        onOpenChange={setShowAlreadyAnalyzedDialog}
        onUpgrade={() => {
          setShowAlreadyAnalyzedDialog(false);
          // Navigate to upgrade page
          window.location.hash = "upgrade";
        }}
      />
    </div>
  );
};

export default SafevinDashboard;
