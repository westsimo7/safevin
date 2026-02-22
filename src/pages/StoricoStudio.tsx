import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/DashboardHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, PenTool, Trash2 } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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

const StoricoStudio = () => {
  const [creations, setCreations] = useState<StudioRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();

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
    const fetch = async () => {
      const { data, error } = await supabase
        .from("studio_creations")
        .select("id, titolo_generato, first_image_url, categoria, created_at")
        .order("created_at", { ascending: false });
      if (!error && data) setCreations(data);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-6 py-12">
        <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground" onClick={() => navigate("/storico")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Torna allo Storico
        </Button>

        <div className="text-center mb-12">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
            <PenTool className="w-3 h-3 mr-1" />
            SAFEViN Studio
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            I tuoi annunci Studio.
          </h1>
          <p className="text-muted-foreground">
            Ogni annuncio creato, pronto per essere riutilizzato.
          </p>
          <Button variant="neon" size="lg" className="group mt-6" onClick={() => navigate("/dashboard")}>
            Crea nuovo annuncio
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground">Caricamento...</div>
        ) : creations.length === 0 ? (
          <div className="text-center text-muted-foreground">Nessun annuncio ancora creato con Studio.</div>
        ) : (
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4 px-1">
              {creations.map((item) => (
                <Card
                  key={item.id}
                  className="min-w-[280px] max-w-[280px] cursor-pointer border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 flex-shrink-0"
                  onClick={() => navigate(`/storico/studio/${item.id}`)}
                >
                  <CardContent className="p-0 relative">
                    <button
                      className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-destructive transition-colors"
                      onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); }}
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
                      <h3 className="font-semibold text-sm truncate mb-1">{item.titolo_generato || "Annuncio senza titolo"}</h3>
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
