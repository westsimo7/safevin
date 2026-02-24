import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppNavbar from "@/components/AppNavbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, PenTool, Trash2, Search, SlidersHorizontal, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/sonner";
import { Input } from "@/components/ui/input";

interface StudioRecord {
  id: string;
  titolo_generato: string | null;
  first_image_url: string | null;
  categoria: string;
  created_at: string;
}

type SortMode = "date_desc" | "date_asc" | "name_asc" | "name_desc";

const sortLabels: Record<SortMode, string> = {
  date_desc: "Più recenti",
  date_asc: "Meno recenti",
  name_asc: "A → Z",
  name_desc: "Z → A",
};

const StoricoStudio = () => {
  const [creations, setCreations] = useState<StudioRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("date_desc");
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("studio_creations").delete().eq("id", deleteId);
    if (!error) {
      setCreations((prev) => prev.filter((a) => a.id !== deleteId));
      toast.success("Annuncio eliminato");
    } else {
      toast.error("Errore durante l'eliminazione");
    }
    setDeleteId(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("studio_creations")
        .select("id, titolo_generato, first_image_url, categoria, created_at")
        .order("created_at", { ascending: false });
      if (!error && data) setCreations(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let list = [...creations];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((a) => (a.titolo_generato || "").toLowerCase().includes(q) || a.categoria.toLowerCase().includes(q));
    }

    switch (sortMode) {
      case "date_asc":
        list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "name_asc":
        list.sort((a, b) => (a.titolo_generato || "").localeCompare(b.titolo_generato || ""));
        break;
      case "name_desc":
        list.sort((a, b) => (b.titolo_generato || "").localeCompare(a.titolo_generato || ""));
        break;
      default:
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return list;
  }, [creations, searchQuery, sortMode]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
        {!isMobile && (
          <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground" onClick={() => navigate("/storico")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna allo Storico
          </Button>
        )}

        <div className="text-center mb-8">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">
            <PenTool className="w-3 h-3 mr-1" />
            SAFEViN Studio
          </Badge>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">I tuoi annunci Studio.</h1>
          <p className="text-sm text-muted-foreground mb-4">Ogni annuncio creato, pronto per essere riutilizzato.</p>
          <Button variant="neon" size="sm" className="group" onClick={() => navigate("/dashboard")}>
            Crea nuovo annuncio
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Filters */}
        {creations.length > 0 && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca per titolo o categoria..."
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
        ) : creations.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">Nessun annuncio ancora creato con Studio.</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">Nessun risultato per "{searchQuery}"</div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-card/50 hover:border-primary/40 hover:bg-card/80 cursor-pointer transition-all duration-200 group"
                onClick={() => navigate(`/storico/studio/${item.id}`)}
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted/30 flex-shrink-0">
                  {item.first_image_url ? (
                    <img src={item.first_image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PenTool className="w-4 h-4 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold truncate">{item.titolo_generato || "Senza titolo"}</h3>
                  <p className="text-[11px] text-muted-foreground">{formatDate(item.created_at)}</p>
                </div>

                {/* Category badge */}
                <Badge variant="outline" className="text-[10px] flex-shrink-0">{item.categoria}</Badge>

                {/* Delete */}
                <button
                  className="p-1.5 rounded-full text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                  onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare questo annuncio?</AlertDialogTitle>
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

export default StoricoStudio;
