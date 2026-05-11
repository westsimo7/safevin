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
import FirstListingPopup from "@/components/FirstListingPopup";
import { usePlan } from "@/hooks/usePlan";
import { removeStudioDraft, upsertStudioDraft, type StudioDraftPhase } from "@/lib/studioDrafts";
import { savePreviews, loadPreviews, removePreviews } from "@/lib/studioPreviews";

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

async function createCoverImageBlob(dataUrl: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const maxSize = 900;
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas non disponibile"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Cover non generata"));
      }, "image/jpeg", 0.72);
    };
    img.onerror = () => reject(new Error("Immagine cover non valida"));
    img.src = dataUrl;
  });
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
  const { state: planState, refresh: refreshPlan } = usePlan();

  const [phase, setPhase] = useState<Phase>("upload");
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [generatedOutput, setGeneratedOutput] = useState<StudioGeneratedOutput | null>(null);
  const [incompleteId, setIncompleteId] = useState<string | null>(null);
  const [showFirstPopup, setShowFirstPopup] = useState(false);

  useEffect(() => {
    const state = location.state as ResumeState;
    if (state?.resumeFrom && state?.resumeData) {
      setAnalysis(state.resumeData.analysis);
      setIncompleteId(state.incompleteId || null);
      setPhase(state.resumeFrom as Phase);
      window.history.replaceState({}, document.title);
      // Load full previews from IndexedDB
      if (state.incompleteId) {
        loadPreviews(state.incompleteId).then((stored) => {
          if (stored.length > 0) setPreviews(stored);
        });
      }
    }
  }, [location.state]);

  const saveDraft = useCallback((draftPhase: StudioDraftPhase, draftAnalysis: ProductAnalysis | null, draftPreviews: string[], existingId?: string | null) => {
    if (!draftAnalysis) return existingId || null;
    try {
      const thumbUrl = draftPreviews[0] ? createThumbnail(draftPreviews[0]) : null;
      const draftId = upsertStudioDraft({
        id: existingId || null,
        categoria: draftAnalysis.category || "",
        first_image_url: thumbUrl,
        incomplete_phase: draftPhase,
        incomplete_data: {
          analysis: draftAnalysis,
          previews: [],
        },
      });
      // Save full previews to IndexedDB (async, non-blocking)
      if (draftPreviews.length > 0) {
        savePreviews(draftId, draftPreviews).catch(() => {});
      }
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

  const saveStudioCreation = async (output: StudioGeneratedOutput, draftIdToRemove: string | null) => {
    try {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) {
        console.error("[Studio] No authenticated user, cannot save:", authErr);
        toast({
          title: "Salvataggio non riuscito",
          description: "Sessione scaduta. Effettua di nuovo l'accesso per salvare nello storico.",
          variant: "destructive",
        });
        return;
      }

      // Try to upload cover, but don't block save if it fails
      let coverUrl: string | null = null;
      if (previews[0]) {
        try {
          const coverBlob = await createCoverImageBlob(previews[0]);
          const coverPath = `${user.id}/studio-cover-${Date.now()}.jpg`;
          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from("analysis-images")
            .upload(coverPath, coverBlob, { contentType: "image/jpeg", upsert: false });

          if (uploadErr) {
            console.warn("[Studio] Cover upload failed, saving without cover:", uploadErr);
          } else if (uploadData) {
            const { data: urlData } = supabase.storage.from("analysis-images").getPublicUrl(uploadData.path);
            coverUrl = urlData.publicUrl;
          }
        } catch (coverErr) {
          console.warn("[Studio] Cover generation failed, saving without cover:", coverErr);
        }
      }

      console.log("[Studio] Inserting studio_creation, draftId:", draftIdToRemove, "coverUrl:", coverUrl);
      const { error: insertErr } = await supabase.from("studio_creations").insert([{
        titolo_generato: output.title || null,
        first_image_url: coverUrl,
        categoria: analysis?.category || "",
        images: coverUrl ? [coverUrl] as any : [] as any,
        questions_answers: [] as any,
        output: output as any,
        origin: "studio",
        status: "complete",
        user_id: user.id,
      }]);

      if (insertErr) {
        console.error("[Studio] Insert studio_creations failed:", insertErr);
        toast({
          title: "Salvataggio non riuscito",
          description: insertErr.message || "Impossibile salvare nello storico.",
          variant: "destructive",
        });
        return;
      }

      console.log("[Studio] Insert OK, removing draft:", draftIdToRemove);
      if (draftIdToRemove) {
        removeStudioDraft(draftIdToRemove);
        removePreviews(draftIdToRemove).catch(() => {});
        setIncompleteId(null);
      }
    } catch (err: any) {
      console.error("[Studio] Failed to save studio creation:", err);
      toast({
        title: "Salvataggio non riuscito",
        description: err?.message || "Errore imprevisto.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateOutput = useCallback(async (userInput: StudioUserInput) => {
    setPhase("generating");

    try {
      const language = (typeof window !== "undefined" && localStorage.getItem("safevin-lang")) || "it";
      const { data, error } = await supabase.functions.invoke("studio-generate", {
        body: { analysis, userInput, language },
      });

      // Handle 403 limit_reached gracefully
      const errCtx: any = (error as any)?.context;
      if (errCtx) {
        try {
          const txt = await errCtx.text();
          const parsed = txt ? JSON.parse(txt) : null;
          if (parsed?.code === "limit_reached") {
            toast({
              title: "Limite annunci raggiunto",
              description: parsed.error || "Hai esaurito gli annunci del tuo piano.",
              variant: "destructive",
            });
            setPhase("input");
            navigate("/pricing");
            return;
          }
          if (parsed?.error) throw new Error(parsed.error);
        } catch (parseErr) {
          if (parseErr instanceof Error && parseErr.message) throw parseErr;
        }
      }

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.output) {
        setGeneratedOutput(data.output);
        setPhase("output");
        await saveStudioCreation(data.output, incompleteId);
      } else {
        throw new Error("Risposta non valida");
      }
    } catch (err: any) {
      console.error("Studio generate error:", err);
      toast({ title: "Errore", description: err.message || "Errore durante la generazione.", variant: "destructive" });
      setPhase("input");
    }
  }, [analysis, toast, previews, incompleteId, navigate]);

  const handleNewAnalysis = useCallback(() => {
    if (incompleteId) {
      removeStudioDraft(incompleteId);
      removePreviews(incompleteId).catch(() => {});
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
            onFinish={() => {
              toast({ title: "Annuncio salvato", description: "Lo trovi nello Storico." });
              navigate("/storico");
            }}
          />
        )}
      </main>
    </div>
  );
};

export default EngineStudio;
