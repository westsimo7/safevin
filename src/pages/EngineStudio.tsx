import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import SmartLoader from "@/components/SmartLoader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import StudioUpload, { compressImage } from "@/components/studio/StudioUpload";
import StudioRecognition, { type ProductAnalysis } from "@/components/studio/StudioRecognition";
import StudioMissingPhotos from "@/components/studio/StudioMissingPhotos";

type Phase = "upload" | "loading" | "recognition" | "missing_photos" | "done";

const EngineStudio = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [phase, setPhase] = useState<Phase>("upload");
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);

  const handleAnalyze = useCallback(async (files: File[], filePreviews: string[]) => {
    setImages(files);
    setPreviews(filePreviews);
    setPhase("loading");

    try {
      const compressed: string[] = [];
      for (const file of files) {
        compressed.push(await compressImage(file));
      }

      const { data, error } = await supabase.functions.invoke("studio-analyze", {
        body: { images: compressed },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.analysis) {
        setAnalysis(data.analysis);
        setPhase("recognition");
      } else {
        throw new Error("Risposta non valida");
      }
    } catch (err: any) {
      console.error("Studio analyze error:", err);
      toast({ title: "Errore", description: err.message || "Errore durante l'analisi.", variant: "destructive" });
      setPhase("upload");
    }
  }, [toast]);

  const handleConfirm = useCallback((confirmed: ProductAnalysis) => {
    setAnalysis(confirmed);
    setPhase("missing_photos");
  }, []);

  const handleAskCoach = useCallback((photoName: string) => {
    // Dispatch custom event to open Coach with context
    window.dispatchEvent(new CustomEvent("open-coach", {
      detail: {
        message: `Ho bisogno di aiuto per scattare la foto: "${photoName}". Spiegami come fare in modo semplice e pratico.`,
      },
    }));
  }, []);

  const handleMissingPhotosContinue = useCallback(() => {
    // Future phases will be implemented here
    toast({ title: "Studio 2.0", description: "Le prossime fasi sono in fase di sviluppo!" });
    setPhase("done");
  }, [toast]);

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="container mx-auto px-6 pt-8 pb-12 max-w-2xl">
        <Button variant="ghost" className="hidden md:inline-flex mb-6 text-muted-foreground hover:text-foreground" onClick={() => navigate("/engine")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Engine Home
        </Button>

        {phase === "upload" && (
          <StudioUpload onAnalyze={handleAnalyze} isLoading={false} />
        )}

        {phase === "loading" && (
          <SmartLoader
            title="Analizzo le tue immagini..."
            messages={[
              "Riconoscimento tipo prodotto…",
              "Identificazione colore e stile…",
              "Ricerca brand visibile…",
              "Valutazione condizioni…",
              "Analisi completezza foto…",
            ]}
          />
        )}

        {phase === "recognition" && analysis && (
          <StudioRecognition
            analysis={analysis}
            previews={previews}
            onConfirm={handleConfirm}
            onBack={() => setPhase("upload")}
          />
        )}

        {phase === "missing_photos" && analysis && (
          <StudioMissingPhotos
            missingPhotos={analysis.missing_photos || []}
            onContinue={handleMissingPhotosContinue}
            onBack={() => setPhase("recognition")}
            onAskCoach={handleAskCoach}
          />
        )}

        {phase === "done" && (
          <div className="text-center pt-12 space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold">Fase 1 e 2 completate! 🎉</h2>
            <p className="text-muted-foreground">Le prossime fasi di Studio 2.0 sono in arrivo.</p>
            <div className="flex flex-col gap-3 max-w-sm mx-auto">
              <Button variant="neon" onClick={() => { setPhase("upload"); setAnalysis(null); setImages([]); setPreviews([]); }}>
                Nuova analisi
              </Button>
              <Button variant="glass" onClick={() => navigate("/engine")}>
                Torna a Engine
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EngineStudio;
