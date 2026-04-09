import { useState, useCallback, useEffect } from "react";
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
import { removeStudioDraft, upsertStudioDraft, type StudioDraftPhase } from "@/lib/studioDrafts";

function createThumbnail(dataUrl: string): string {
  // Return a truncated version — just keep first 200 chars as identifier
  // The actual thumbnail will be the first_image_url shown in incomplete list
  try {
    const canvas = document.createElement("canvas");
    const img = new Image();
    img.src = dataUrl;
    canvas.width = 80;
    canvas.height = 80;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(img, 0, 0, 80, 80);
      return canvas.toDataURL("image/jpeg", 0.4);
    }
  } catch {}
  return dataUrl.substring(0, 200);
}


type Phase = "upload" | "loading" | "recognition" | "missing_photos" | "input" | "generating" | "output";

type ResumeState = {
  resumeFrom?: string;
  resumeData?: { analysis: ProductAnalysis; previews: string[] };
  incompleteId?: string;
} | null;

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

  useEffect(() => {
    const state = location.state as ResumeState;
    if (state?.resumeFrom && state?.resumeData) {
      setAnalysis(state.resumeData.analysis);
      setPreviews(state.resumeData.previews || []);
      setIncompleteId(state.incompleteId || null);
      setPhase(state.resumeFrom as Phase);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const saveDraft = useCallback((draftPhase: StudioDraftPhase, draftAnalysis: ProductAnalysis | null, draftPreviews: string[], existingId?: string | null) => {
    if (!draftAnalysis) return existingId || null;
    try {
      // Save only a small thumbnail for the list, not full base64 previews
      const thumbUrl = draftPreviews[0] ? createThumbnail(draftPreviews[0]) : null;
      const draftId = upsertStudioDraft({
        id: existingId || null,
        categoria: draftAnalysis.category || "",
        first_image_url: thumbUrl,
        incomplete_phase: draftPhase,
        incomplete_data: {
          analysis: draftAnalysis,
          previews: [], // don't store full base64 in localStorage
        },
      });
      setIncompleteId(draftId);
      return draftId;
    } catch (err) {
      console.warn("Draft save failed (non-blocking):", err);
      return existingId || null;
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
        saveDraft("recognition", data.analysis, filePreviews, null);
        setPhase("recognition");
      } else {
        throw new Error("Risposta non valida");
      }
    } catch (err: any) {
      console.error("Studio analyze error:", err);
      toast({ title: "Errore", description: err.message || "Errore durante l'analisi.", variant: "destructive" });
      setPhase("upload");
    }
  }, [toast, saveDraft]);

  const handleConfirm = useCallback((confirmed: ProductAnalysis) => {
    setAnalysis(confirmed);
    saveDraft("missing_photos", confirmed, previews, incompleteId);
    setPhase("missing_photos");
  }, [previews, incompleteId, saveDraft]);

  const handleAskCoach = useCallback((photoName: string) => {
    navigate("/coach", {
      state: {
        message: `Ho bisogno di aiuto per scattare la foto: "${photoName}". Spiegami come fare in modo semplice e pratico.`,
      },
    });
  }, [navigate]);

  const handleSaveIncompleteAndGoCoach = useCallback((reportSummary: string, coachImages: string[]) => {
    navigate("/coach", {
      state: { studioReport: reportSummary, images: coachImages },
    });
  }, [navigate]);

  const handleMissingPhotosContinue = useCallback(() => {
    saveDraft("input", analysis, previews, incompleteId);
    setPhase("input");
  }, [analysis, previews, incompleteId, saveDraft]);

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
      if (incompleteId) {
        removeStudioDraft(incompleteId);
        setIncompleteId(null);
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
    if (incompleteId) {
      removeStudioDraft(incompleteId);
    }
    setPhase("upload");
    setAnalysis(null);
    setImages([]);
    setPreviews([]);
    setGeneratedOutput(null);
    setIncompleteId(null);
  }, [incompleteId]);

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
