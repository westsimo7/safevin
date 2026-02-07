import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/DashboardHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, ArrowRight, History, ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface AnalysisRecord {
  id: string;
  titolo: string;
  first_image_url: string | null;
  analysis_result: any;
  created_at: string;
}

const Storico = () => {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalyses = async () => {
      const { data, error } = await supabase
        .from("analyses")
        .select("id, titolo, first_image_url, analysis_result, created_at")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setAnalyses(data);
      }
      setLoading(false);
    };
    fetchAnalyses();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-6">
            <History className="w-3 h-3 mr-1" />
            Storico Analisi
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Riguarda le tue analisi
            <br />
            <span className="text-primary">e monitora i progressi</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
            Tutte le analisi che hai effettuato, salvate e pronte per essere consultate.
          </p>

          <Button
            variant="neon"
            size="lg"
            className="group mb-12"
            onClick={() => navigate("/dashboard")}
          >
            Analizza un annuncio
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground">Caricamento...</div>
        ) : analyses.length === 0 ? (
          <div className="text-center text-muted-foreground">
            Nessuna analisi ancora. Inizia analizzando il tuo primo annuncio!
          </div>
        ) : (
          <div className="relative">
            <ScrollArea className="w-full">
              <div className="flex gap-4 pb-4 px-1">
                {analyses.map((analysis) => (
                  <Card
                    key={analysis.id}
                    className="min-w-[280px] max-w-[280px] cursor-pointer border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 flex-shrink-0"
                    onClick={() => navigate(`/storico/${analysis.id}`)}
                  >
                    <CardContent className="p-0">
                      <div className="h-40 bg-muted/30 rounded-t-lg overflow-hidden">
                        {analysis.first_image_url ? (
                          <img
                            src={analysis.first_image_url}
                            alt={analysis.titolo || "Analisi"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-sm truncate mb-1">
                          {analysis.titolo || "Annuncio senza titolo"}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {new Date(analysis.created_at).toLocaleDateString("it-IT", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        {analysis.analysis_result?.overallScore !== undefined && (
                          <Badge
                            variant="outline"
                            className={`mt-2 text-xs ${
                              analysis.analysis_result.overallScore >= 70
                                ? "bg-green-500/10 text-green-400 border-green-500/30"
                                : analysis.analysis_result.overallScore >= 40
                                ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                                : "bg-red-500/10 text-red-400 border-red-500/30"
                            }`}
                          >
                            Score: {analysis.analysis_result.overallScore}/100
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}
      </main>
    </div>
  );
};

export default Storico;
