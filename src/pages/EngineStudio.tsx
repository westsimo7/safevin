import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

const SAVEABLE_PHASES: Phase[] = ["recognition", "missing_photos", "input"];

const EngineStudio = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [phase, setPhase] = useState<Phase>("upload");
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [generatedOutput, setGeneratedOutput] = useState<StudioGeneratedOutput | null>(null);
  const [incompleteId, setIncompleteId] = useState<string | null>(null);

  // Resume from incomplete creation if navigated with state
  useEffect(() => {
    const state = location.state as {
      resumeFrom?: string;
      resumeData?: { analysis: ProductAnalysis; previews: string[] };
      incompleteId?: string;
    } | null;

    if (state?.resumeFrom && state?.resumeData) {
      setAnalysis(state.resumeData.analysis);
      setPreviews(state.resumeData.previews || []);
      setIncompleteId(state.incompleteId || null);
      setPhase(state.resumeFrom as Phase);
      window.history.replaceState({}, document.title);
    }
  }, []);

  // Save/update incomplete record immediately when entering a saveable phase
  const saveIncomplete = useCallback(async (
    currentPhase: Phase,
    currentAnalysis: ProductAnalysis | null,
    currentPreviews: string[],
    currentIncompleteId: string | null,
  ) => {
    if (!SAVEABLE_PHASES.includes(currentPhase) || !currentAnalysis) return currentIncompleteId;

    const incompleteData = { analysis: currentAnalysis, previews: currentPreviews };

    try {
      if (currentIncompleteId) {
        await supabase.from("studio_creations").update({
          incomplete_phase: currentPhase,
          incomplete_data: incompleteData as any,
          first_image_url: currentPreviews[0] || null,
          categoria: currentAnalysis.category || "",
        }).eq("id", currentIncompleteId);
        return currentIncompleteId;
      } else {
        const { data } = await supabase.from("studio_creations").insert([{
          first_image_url: currentPreviews[0] || null,
          categoria: currentAnalysis.category || "",
          images: currentPreviews as any,
          questions_answers: [] as any,
          output: null,
          origin: "studio",
          status: "incomplete",
          incomplete_phase: currentPhase,
          incomplete_data: incompleteData as any,
        }]).select("id").single();
        return data?.id || null;
      }
    } catch (err) {
      console.error("Failed to save incomplete:", err);
      return currentIncompleteId;
    }
  }, []);

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
        // Save as incomplete immediately
        const newId = await saveIncomplete("recognition", data.analysis, filePreviews, null);
        if (newId) setIncompleteId(newId);
      } else {
        throw new Error("Risposta non valida");
      }
    } catch (err: any) {
      console.error("Studio analyze error:", err);
      toast({ title: "Errore", description: err.message || "Errore durante l'analisi.", variant: "destructive" });
      setPhase("upload");
    }
  }, [toast, saveIncomplete]);

  const handleConfirm = useCallback(async (confirmed: ProductAnalysis) => {
    setAnalysis(confirmed);
    setPhase("missing_photos");
    // Update incomplete
    const newId = await saveIncomplete("missing_photos", confirmed, previews, incompleteId);
    if (newId) setIncompleteId(newId);
  }, [previews, incompleteId, saveIncomplete]);

  const handleAskCoach = useCallback((photoName: string) => {
    navigate("/coach", {
      state: {
        message: `Ho bisogno di aiuto per scattare la foto: "${photoName}". Spiegami come fare in modo semplice e pratico.`,
      },
    });
  }, [navigate]);

  const handleSaveIncompleteAndGoCoach = useCallback(async (reportSummary: string, coachImages: string[]) => {
    // Already saved as incomplete, just navigate
    navigate("/coach", {
      state: { studioReport: reportSummary, images: coachImages },
    });
  }, [navigate]);

  const handleMissingPhotosContinue = useCallback(async () => {
    setPhase("input");
    // Update incomplete
    const newId = await saveIncomplete("input", analysis, previews, incompleteId);
    if (newId) setIncompleteId(newId);
  }, [analysis, previews, incompleteId, saveIncomplete]);

  const saveStudioCreation = async (output: StudioGeneratedOutput) => {
    try {
      if (incompleteId) {
        // Complete the previously incomplete creation
        await supabase.from("studio_creations").update({
          titolo_generato: output.title || null,
          output: output as any,
          status: "complete",
          incomplete_phase: null,
          incomplete_data: null,
        }).eq("id", incompleteId);
      } else {
        await supabase.from("studio_creations").insert([{
          titolo_generato: output.title || null,
          first_image_url: previews[0] || null,
          categoria: analysis?.category || "",
          images: previews as any,
          questions_answers: [] as any,
          output: output as any,
          origin: "studio",
        }]);
      }
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
  }, [analysis, toast, previews, incompleteId]);

  const handleNewAnalysis = useCallback(() => {
    setPhase("upload");
    setAnalysis(null);
    setImages([]);
    setPreviews([]);
    setGeneratedOutput(null);
    setIncompleteId(null);
  }, []);

  useSwipeBack("/home");

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">
      <AppNavbar />

      <main className={`flex-1 overflow-x-hidden px-4 sm:px-6 lg:px-56 xl:px-96 pt-4 sm:pt-6 pb-6 sm:pb-8 ${phase === "upload" || phase === "missing_photos" ? "overflow-hidden flex flex-col" : "overflow-y-auto"}`}>
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
            onSaveIncompleteAndGoCoach={handleSaveIncompleteAndGoCoach}
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
