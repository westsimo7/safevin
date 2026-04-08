import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import SmartLoader from "@/components/SmartLoader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import StudioUpload, { compressImage } from "@/components/studio/StudioUpload";
import StudioRecognition, { type ProductAnalysis } from "@/components/studio/StudioRecognition";
import StudioMissingPhotos from "@/components/studio/StudioMissingPhotos";
import StudioInput, { type StudioUserInput } from "@/components/studio/StudioInput";
import StudioOutput, { type StudioGeneratedOutput } from "@/components/studio/StudioOutput";

type Phase = "upload" | "loading" | "recognition" | "missing_photos" | "input" | "generating" | "output";

const EngineStudio = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [phase, setPhase] = useState<Phase>("upload");
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [generatedOutput, setGeneratedOutput] = useState<StudioGeneratedOutput | null>(null);

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
    navigate("/coach", {
      state: {
        message: `Ho bisogno di aiuto per scattare la foto: "${photoName}". Spiegami come fare in modo semplice e pratico.`,
      },
    });
  }, [navigate]);

  const handleMissingPhotosContinue = useCallback(() => {
    setPhase("input");
  }, []);

  const saveStudioCreation = async (output: StudioGeneratedOutput) => {
    try {
      await supabase.from("studio_creations").insert([{
        titolo_generato: output.title || null,
        first_image_url: previews[0] || null,
        categoria: analysis?.category || "",
        images: previews as any,
        questions_answers: [] as any,
        output: output as any,
        origin: "studio",
      }]);
    } catch (err) {
      console.error("Failed to save studio creation:", err);
    }
  };

  const handleGenerateOutput = useCallback(async (userInput: StudioUserInput) => {
    setPhase("generating");

    try {
      const { data, error } = await supabase.functions.invoke("studio-generate", {
        body: { analysis, userInput },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.output) {
        setGeneratedOutput(data.output);
        setPhase("output");
        await saveStudioCreation(data.output);
      } else {
        throw new Error("Risposta non valida");
      }
    } catch (err: any) {
      console.error("Studio generate error:", err);
      toast({ title: "Errore", description: err.message || "Errore durante la generazione.", variant: "destructive" });
      setPhase("input");
    }
  }, [analysis, toast, previews]);

  const handleNewAnalysis = useCallback(() => {
    setPhase("upload");
    setAnalysis(null);
    setImages([]);
    setPreviews([]);
    setGeneratedOutput(null);
  }, []);

  useSwipeBack("/home");

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-12 xl:px-24 pt-4 sm:pt-8 pb-8 sm:pb-12">
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
            photoQuality={analysis.photo_quality || []}
            previews={previews}
            onContinue={handleMissingPhotosContinue}
            onBack={() => setPhase("recognition")}
            onAskCoach={handleAskCoach}
          />
        )}

        {phase === "input" && analysis && (
          <StudioInput
            analysis={analysis}
            onContinue={handleGenerateOutput}
            onBack={() => setPhase("missing_photos")}
          />
        )}

        {phase === "generating" && (
          <SmartLoader
            title="Creo il tuo annuncio..."
            messages={[
              "Genero titolo ottimizzato…",
              "Scrivo descrizione con keyword…",
              "Calcolo prezzo strategico…",
              "Preparo strategia trattativa…",
              "Finalizzazione annuncio…",
            ]}
          />
        )}

        {phase === "output" && generatedOutput && (
          <StudioOutput
            output={generatedOutput}
            onNewAnalysis={handleNewAnalysis}
            onBack={() => setPhase("input")}
          />
        )}
      </main>
    </div>
  );
};

export default EngineStudio;
