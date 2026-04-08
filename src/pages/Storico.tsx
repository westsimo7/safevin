import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppNavbar from "@/components/AppNavbar";
import PageTitle from "@/components/PageTitle";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PenTool, Search, Trash2, X, History } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/sonner";

interface StudioRecord {
  id: string;
  titolo_generato: string | null;
  first_image_url: string | null;
  categoria: string;
  created_at: string;
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`;
};

const Storico = () => {
  const [creations, setCreations] = useState<StudioRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("studio_creations").select("id, titolo_generato, first_image_url, categoria, created_at").order("created_at", { ascending: false });
      if (data) setCreations(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("studio_creations").delete().eq("id", deleteTarget.id);
    if (!error) setCreations(prev => prev.filter(c => c.id !== deleteTarget.id));
    toast.success("Eliminato");
    setDeleteTarget(null);
  };

  const filtered = useMemo(() => {
    let list = [...creations];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => (c.titolo_generato || "").toLowerCase().includes(q) || c.categoria.toLowerCase().includes(q));
    }
    return list;
  }, [creations, searchQuery]);

  useSwipeBack("/home");

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">
      <AppNavbar />

      <main className="flex-1 overflow-y-auto overflow-x-hidden container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
        <div className="text-center mb-6">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">
            <History className="w-3 h-3 mr-1" />
            Storico
          </Badge>
          <PageTitle title="I tuoi lavori" backTo="/home" className="text-center" />
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
            {filtered.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                {searchQuery ? `Nessun risultato per "${searchQuery}"` : "Nessuna creazione ancora."}
              </div>
            )}

            {filtered.map(item => (
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
                <button
                  className="p-1.5 rounded-full text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                  onClick={e => { e.stopPropagation(); setDeleteTarget({ id: item.id }); }}
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
