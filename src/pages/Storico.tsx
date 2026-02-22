import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/DashboardHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, ArrowRight, History, Trash2, PenTool, Search, TrendingUp } from "lucide-react";
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

interface StudioRecord {
  id: string;
  titolo_generato: string | null;
  first_image_url: string | null;
  categoria: string;
  created_at: string;
}

const Storico = () => {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [studioCreations, setStudioCreations] = useState<StudioRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<"audit" | "studio">("audit");
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!deleteId) return;
    const table = deleteType === "audit" ? "analyses" : "studio_creations";
    const { error } = await supabase.from(table).delete().eq("id", deleteId);
    if (!error) {
      if (deleteType === "audit") {
        setAnalyses((prev) => prev.filter((a) => a.id !== deleteId));
      } else {
        setStudioCreations((prev) => prev.filter((a) => a.id !== deleteId));
      }
      toast.success("Elemento eliminato");
    } else {
      toast.error("Errore durante l'eliminazione");
    }
    setDeleteId(null);
  };

  useEffect(() => {
    const fetchAll = async () => {
      const [analysesRes, studioRes] = await Promise.all([
        supabase
          .from("analyses")
          .select("id, titolo, first_image_url, analysis_result, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("studio_creations")
          .select("id, titolo_generato, first_image_url, categoria, created_at")
          .order("created_at", { ascending: false }),
      ]);

      if (!analysesRes.error && analysesRes.data) setAnalyses(analysesRes.data);
      if (!studioRes.error && studioRes.data) setStudioCreations(studioRes.data);
      setLoading(false);
    };
    fetchAll();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-6">
            <History className="w-3 h-3 mr-1" />
            I tuoi lavori
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Storico completo.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tutti i tuoi annunci e audit in un unico punto.
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16">
          <Card className="border-border/50 hover:border-primary/50 transition-all cursor-pointer" onClick={() => navigate("/dashboard")}>
            <CardHeader>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                <PenTool className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg">SAFEViN Studio</CardTitle>
              <CardDescription>
                In questa sezione trovi tutti gli annunci creati con SAFEViN Studio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="glass" size="sm" className="group">
                Vai ai tuoi annunci Studio
                <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-primary/50 transition-all cursor-pointer" onClick={() => navigate("/dashboard")}>
            <CardHeader>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                <Search className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg">SAFEViN Audit</CardTitle>
              <CardDescription>
                In questa sezione trovi tutte le analisi effettuate con SAFEViN Audit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="glass" size="sm" className="group">
                Vai ai tuoi Audit
                <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground">Caricamento...</div>
        ) : (
          <div className="space-y-12">
            {/* Studio Creations */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-primary" />
                Annunci Studio
              </h2>
              {studioCreations.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nessun annuncio ancora creato con Studio.</p>
              ) : (
                <ScrollArea className="w-full">
                  <div className="flex gap-4 pb-4 px-1">
                    {studioCreations.map((item) => (
                      <Card
                        key={item.id}
                        className="min-w-[280px] max-w-[280px] cursor-pointer border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 flex-shrink-0"
                        onClick={() => navigate(`/storico/studio/${item.id}`)}
                      >
                        <CardContent className="p-0 relative">
                          <button
                            className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-destructive transition-colors"
                            onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); setDeleteType("studio"); }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="h-40 bg-muted/30 rounded-t-lg overflow-hidden">
                            {item.first_image_url ? (
                              <img src={item.first_image_url} alt={item.titolo_generato || "Annuncio"} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <PenTool className="w-8 h-8 text-muted-foreground/30" />
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-sm truncate mb-1">
                              {item.titolo_generato || "Annuncio senza titolo"}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {new Date(item.created_at).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}
                            </p>
                            <Badge variant="outline" className="mt-2 text-xs">{item.categoria}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              )}
            </section>

            {/* Audit Analyses */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                Audit SafeScore™
              </h2>
              {analyses.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nessun Audit ancora effettuato.</p>
              ) : (
                <ScrollArea className="w-full">
                  <div className="flex gap-4 pb-4 px-1">
                    {analyses.map((analysis) => (
                      <Card
                        key={analysis.id}
                        className="min-w-[280px] max-w-[280px] cursor-pointer border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 flex-shrink-0"
                        onClick={() => navigate(`/storico/${analysis.id}`)}
                      >
                        <CardContent className="p-0 relative">
                          <button
                            className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-destructive transition-colors"
                            onClick={(e) => { e.stopPropagation(); setDeleteId(analysis.id); setDeleteType("audit"); }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="h-40 bg-muted/30 rounded-t-lg overflow-hidden">
                            {analysis.first_image_url ? (
                              <img src={analysis.first_image_url} alt={analysis.titolo || "Analisi"} className="w-full h-full object-cover" />
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
                              {new Date(analysis.created_at).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}
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
                                SafeScore™ {analysis.analysis_result.overallScore}/100
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              )}
            </section>
          </div>
        )}
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare questo elemento?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione è irreversibile. L'elemento verrà rimosso definitivamente.
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
