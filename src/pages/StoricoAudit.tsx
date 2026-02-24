import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppNavbar from "@/components/AppNavbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, ArrowRight, Search, Trash2, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/sonner";
import { Input } from "@/components/ui/input";

interface AnalysisRecord {
  id: string;
  titolo: string;
  first_image_url: string | null;
  analysis_result: any;
  created_at: string;
}

type SortMode = "date_desc" | "date_asc" | "score_high" | "score_low" | "worst_cat" | "best_cat";

const getScore = (a: AnalysisRecord) =>
  (a.analysis_result?.sections as any[] | undefined)?.reduce((sum: number, s: any) => sum + (s.score || 0), 0) ?? 0;

const getWorstCatScore = (a: AnalysisRecord) => {
  const sections = a.analysis_result?.sections as any[] | undefined;
  if (!sections?.length) return 10;
  return Math.min(...sections.map((s: any) => s.score ?? 10));
};

const getBestCatScore = (a: AnalysisRecord) => {
  const sections = a.analysis_result?.sections as any[] | undefined;
  if (!sections?.length) return 0;
  return Math.max(...sections.map((s: any) => s.score ?? 0));
};

const sortLabels: Record<SortMode, string> = {
  date_desc: "Più recenti",
  date_asc: "Meno recenti",
  score_high: "Score più alto",
  score_low: "Score più basso",
  worst_cat: "Categoria peggiore",
  best_cat: "Categoria migliore",
};

const StoricoAudit = () => {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("date_desc");
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("analyses").delete().eq("id", deleteId);
    if (!error) {
      setAnalyses((prev) => prev.filter((a) => a.id !== deleteId));
      toast.success("Audit eliminato");
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
      if (!error && data) setAnalyses(data);
      setLoading(false);
    };
    fetchAnalyses();
  }, []);

  const filtered = useMemo(() => {
    let list = [...analyses];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((a) => (a.titolo || "").toLowerCase().includes(q));
    }

    switch (sortMode) {
      case "date_asc":
        list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "score_high":
        list.sort((a, b) => getScore(b) - getScore(a));
        break;
      case "score_low":
        list.sort((a, b) => getScore(a) - getScore(b));
        break;
      case "worst_cat":
        list.sort((a, b) => getWorstCatScore(a) - getWorstCatScore(b));
        break;
      case "best_cat":
        list.sort((a, b) => getBestCatScore(b) - getBestCatScore(a));
        break;
      default:
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return list;
  }, [analyses, searchQuery, sortMode]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-400";
    if (score >= 40) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return "bg-green-500/10 border-green-500/30";
    if (score >= 40) return "bg-yellow-500/10 border-yellow-500/30";
    return "bg-red-500/10 border-red-500/30";
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
        {!isMobile && (
          <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground" onClick={() => navigate("/storico")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna allo Storico
          </Button>
        )}

        <div className="text-center mb-8">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">
            <Search className="w-3 h-3 mr-1" />
            SAFEViN Audit
          </Badge>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">I tuoi Audit.</h1>
          <p className="text-sm text-muted-foreground mb-4">Confronta, monitora, migliora.</p>
          <Button variant="neon" size="sm" className="group" onClick={() => navigate("/dashboard")}>
            Avvia nuovo Audit
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Filters */}
        {analyses.length > 0 && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca per titolo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm bg-card border-border/50"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className={`h-9 gap-1.5 text-xs ${showFilters ? "border-primary text-primary" : "border-border/50"}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filtri
              </Button>
            </div>

            {showFilters && (
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(sortLabels) as SortMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSortMode(mode)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      sortMode === mode
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {sortLabels[mode]}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="text-center text-muted-foreground py-12">Caricamento...</div>
        ) : analyses.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">Nessun Audit ancora. Avvia il primo per ottenere il tuo SafeScore™.</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">Nessun risultato per "{searchQuery}"</div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((analysis) => {
              const score = getScore(analysis);
              return (
                <div
                  key={analysis.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-card/50 hover:border-primary/40 hover:bg-card/80 cursor-pointer transition-all duration-200 group"
                  onClick={() => navigate(`/storico/${analysis.id}`)}
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted/30 flex-shrink-0">
                    {analysis.first_image_url ? (
                      <img src={analysis.first_image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate">{analysis.titolo || "Senza titolo"}</h3>
                    <p className="text-[11px] text-muted-foreground">{formatDate(analysis.created_at)}</p>
                  </div>

                  {/* Score */}
                  <div className={`px-2.5 py-1 rounded-lg border text-center flex-shrink-0 ${getScoreBg(score)}`}>
                    <span className={`text-base font-bold ${getScoreColor(score)}`}>{score}</span>
                    <span className="text-[10px] text-muted-foreground">/100</span>
                  </div>

                  {/* Delete */}
                  <button
                    className="p-1.5 rounded-full text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                    onClick={(e) => { e.stopPropagation(); setDeleteId(analysis.id); }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare questo Audit?</AlertDialogTitle>
            <AlertDialogDescription>Questa azione è irreversibile.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StoricoAudit;
