import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/DashboardHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, ArrowRight, History, Trash2 } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
import { toast } from "@/components/ui/sonner";

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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("analyses").delete().eq("id", deleteId);
    if (!error) {
      setAnalyses((prev) => prev.filter((a) => a.id !== deleteId));
      toast.success("Analisi eliminata");
    } else {
      toast.error("Errore durante l'eliminazione");
    }
    setDeleteId(null);
  };

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
            Storico Audit
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            I tuoi Audit.
            <br />
            <span className="text-primary">Tutti in un punto.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
            Ogni analisi salvata, ogni SafeScore™ tracciato. Confronta, monitora, migliora.
          </p>

          <Button
            variant="neon"
            size="lg"
            className="group mb-12"
            onClick={() => navigate("/dashboard")}
          >
            Avvia nuovo Audit
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground">Caricamento...</div>
        ) : analyses.length === 0 ? (
          <div className="text-center text-muted-foreground">
            Nessun Audit ancora. Avvia il primo per ottenere il tuo SafeScore™.
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
                    <CardContent className="p-0 relative">
                      <button
                        className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors"
                        onClick={(e) => { e.stopPropagation(); setDeleteId(analysis.id); }}
                        aria-label="Elimina analisi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare questo Audit?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione è irreversibile. L'Audit e il relativo SafeScore™ verranno rimossi definitivamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Storico;
