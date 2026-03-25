import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppNavbar from "@/components/AppNavbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, PenTool, FileText, Search, Trash2, X, History } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/sonner";

type Tab = "full" | "creations";

interface AnalysisRecord {
  id: string;
  titolo: string;
  first_image_url: string | null;
  analysis_result: any;
  created_at: string;
  analysis_type: string;
}

interface StudioRecord {
  id: string;
  titolo_generato: string | null;
  first_image_url: string | null;
  categoria: string;
  created_at: string;
}

const tabLabels: Record<Tab, { label: string; icon: React.ReactNode }> = {
  full: { label: "Audit", icon: <FileText className="w-3.5 h-3.5" /> },
  creations: { label: "Studio", icon: <PenTool className="w-3.5 h-3.5" /> },
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`;
};

const getScore = (a: AnalysisRecord) =>
  (a.analysis_result?.sections as any[] | undefined)?.reduce((sum: number, s: any) => sum + (s.score || 0), 0) ?? 0;

const getScoreColor = (score: number) => {
  if (score >= 75) return "text-green-400";
  if (score >= 55) return "text-yellow-400";
  if (score >= 48) return "text-orange-400";
  return "text-red-400";
};

const getScoreBg = (score: number) => {
  if (score >= 75) return "bg-green-500/10 border-green-500/30";
  if (score >= 55) return "bg-yellow-500/10 border-yellow-500/30";
  if (score >= 48) return "bg-orange-500/10 border-orange-500/30";
  return "bg-red-500/10 border-red-500/30";
};

const Storico = () => {
  const [tab, setTab] = useState<Tab>("full");
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [creations, setCreations] = useState<StudioRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: "analysis" | "creation" } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      const [analysesRes, creationsRes] = await Promise.all([
        supabase.from("analyses").select("id, titolo, first_image_url, analysis_result, created_at, analysis_type").order("created_at", { ascending: false }),
        supabase.from("studio_creations").select("id, titolo_generato, first_image_url, categoria, created_at").order("created_at", { ascending: false }),
      ]);
      if (analysesRes.data) setAnalyses((analysesRes.data as any).filter((a: AnalysisRecord) => (a.analysis_type || "full") !== "image_only"));
      if (creationsRes.data) setCreations(creationsRes.data);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "analysis") {
      const { error } = await supabase.from("analyses").delete().eq("id", deleteTarget.id);
      if (!error) setAnalyses(prev => prev.filter(a => a.id !== deleteTarget.id));
    } else {
      const { error } = await supabase.from("studio_creations").delete().eq("id", deleteTarget.id);
      if (!error) setCreations(prev => prev.filter(c => c.id !== deleteTarget.id));
    }
    toast.success("Eliminato");
    setDeleteTarget(null);
  };

  const filteredAnalyses = useMemo(() => {
    if (tab !== "full") return [];
    let list = [...analyses];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a => (a.titolo || "").toLowerCase().includes(q));
    }
    return list;
  }, [analyses, tab, searchQuery]);

  const filteredCreations = useMemo(() => {
    if (tab !== "creations") return [];
    let list = [...creations];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => (c.titolo_generato || "").toLowerCase().includes(q) || c.categoria.toLowerCase().includes(q));
    }
    return list;
  }, [creations, tab, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
        <div className="text-center mb-6">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">
            <History className="w-3 h-3 mr-1" />
            Storico
          </Badge>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">I tuoi lavori</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
          {(Object.keys(tabLabels) as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setSearchQuery(""); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                tab === t ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {tabLabels[t].icon}
              {tabLabels[t].label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Cerca..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-9 text-sm bg-card border-border/50" />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-12">Caricamento...</div>
        ) : (
          <div className="flex flex-col gap-2">
            {tab === "full" && filteredAnalyses.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                {searchQuery ? `Nessun risultato per "${searchQuery}"` : "Nessuna analisi in questa categoria."}
              </div>
            )}
            {tab === "creations" && filteredCreations.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                {searchQuery ? `Nessun risultato per "${searchQuery}"` : "Nessuna creazione ancora."}
              </div>
            )}

            {/* Analysis items */}
            {tab === "full" && filteredAnalyses.map(item => {
              const score = getScore(item);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-card/50 hover:border-primary/40 hover:bg-card/80 cursor-pointer transition-all group"
                  onClick={() => navigate(`/storico/${item.id}`)}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted/30 flex-shrink-0">
                    {item.first_image_url ? (
                      <img src={item.first_image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate">{item.titolo || "Senza titolo"}</h3>
                    <p className="text-[11px] text-muted-foreground">{formatDate(item.created_at)}</p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-lg border text-center flex-shrink-0 ${getScoreBg(score)}`}>
                    <span className={`text-base font-bold ${getScoreColor(score)}`}>{score}</span>
                    <span className="text-[10px] text-muted-foreground">/100</span>
                  </div>
                  <button
                    className="p-1.5 rounded-full text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                    onClick={e => { e.stopPropagation(); setDeleteTarget({ id: item.id, type: "analysis" }); }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}

            {/* Creation items */}
            {tab === "creations" && filteredCreations.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-card/50 hover:border-primary/40 hover:bg-card/80 cursor-pointer transition-all group"
                onClick={() => navigate(`/storico/studio/${item.id}`)}
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted/30 flex-shrink-0">
                  {item.first_image_url ? (
                    <img src={item.first_image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PenTool className="w-4 h-4 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold truncate">{item.titolo_generato || "Senza titolo"}</h3>
                  <p className="text-[11px] text-muted-foreground">{formatDate(item.created_at)}</p>
                </div>
                <Badge variant="outline" className="text-[10px] flex-shrink-0">{item.categoria}</Badge>
                <button
                  className="p-1.5 rounded-full text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                  onClick={e => { e.stopPropagation(); setDeleteTarget({ id: item.id, type: "creation" }); }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare questo elemento?</AlertDialogTitle>
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

export default Storico;
