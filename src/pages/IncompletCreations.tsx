import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppNavbar from "@/components/AppNavbar";
import PageTitle from "@/components/PageTitle";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { Badge } from "@/components/ui/badge";
import { PenTool, Trash2, Clock, ArrowRight } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/sonner";

interface IncompleteRecord {
  id: string;
  first_image_url: string | null;
  categoria: string;
  created_at: string;
  incomplete_phase: string | null;
  incomplete_data: any;
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`;
};

const phaseLabel = (phase: string | null) => {
  switch (phase) {
    case "recognition": return "Riconoscimento";
    case "missing_photos": return "Resoconto foto";
    case "input": return "Dettagli tecnici";
    case "generating": return "Generazione";
    default: return "In corso";
  }
};

const IncompleteCreations = () => {
  const [creations, setCreations] = useState<IncompleteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("studio_creations")
        .select("id, first_image_url, categoria, created_at, incomplete_phase, incomplete_data")
        .eq("status", "incomplete")
        .order("created_at", { ascending: false });
      if (data) setCreations(data as IncompleteRecord[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("studio_creations").delete().eq("id", deleteTarget.id);
    if (!error) setCreations(prev => prev.filter(c => c.id !== deleteTarget.id));
    toast.success("Eliminato");
    setDeleteTarget(null);
  };

  const handleResume = (item: IncompleteRecord) => {
    // Navigate to Studio with the saved state to resume
    navigate("/engine/studio", {
      state: {
        resumeFrom: item.incomplete_phase,
        resumeData: item.incomplete_data,
        incompleteId: item.id,
      },
    });
  };

  useSwipeBack("/home");

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">
      <AppNavbar />

      <div className="shrink-0 container mx-auto px-4 sm:px-6 pt-8 pb-4 max-w-4xl">
        <div className="text-center mb-6">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">
            <Clock className="w-3 h-3 mr-1" />
            In corso
          </Badge>
          <PageTitle title="Lavori incompleti" className="text-center" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden container mx-auto px-4 sm:px-6 max-w-4xl">
        {loading ? (
          <div className="text-center text-muted-foreground py-12">Caricamento...</div>
        ) : (
          <div className="flex flex-col gap-2 pb-6">
            {creations.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                Nessun lavoro incompleto.
              </div>
            )}

            {creations.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-card/50 hover:border-primary/40 hover:bg-card/80 cursor-pointer transition-all group"
                onClick={() => handleResume(item)}
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
                  <h3 className="text-sm font-semibold truncate">{item.categoria || "Annuncio"}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] text-muted-foreground">{formatDate(item.created_at)}</p>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-primary/30 text-primary">
                      {phaseLabel(item.incomplete_phase)}
                    </Badge>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors flex-shrink-0" />
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
      </div>

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

export default IncompleteCreations;
