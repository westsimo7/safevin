import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CategorySelector from "./CategorySelector";
import PhotoUploader from "./PhotoUploader";
import DynamicQuestions from "./DynamicQuestions";
import StudioOutput from "./StudioOutput";
import SmartLoader from "@/components/SmartLoader";
import VisionConfirmation from "./VisionConfirmation";

export type StudioStep =
  | "category"
  | "photos"
  | "vision-loading"
  | "vision-confirm"
  | "questions"
  | "generating"
  | "output";

interface QuestionAnswer {
  question: string;
  answer: string;
}

interface StudioOutputData {
  titolo: string;
  descrizione: string;
  bulletPoints: string[];
  trustElements?: string[];
  trustSection?: {
    buyerQuestions: string[];
    actionChecklist: string[];
    strategicScripts: { label: string; script: string }[];
  };
  keywordIntelligence?: {
    inspirationalText?: string;
    highlightedKeywords?: string[];
    mentalFilters?: {
      occasioni?: string[];
      stagione?: string[];
      outfitAbbinamenti?: string[];
      sinonimiItaliani?: string[];
      intentoAcquisto?: string[];
    };
    strategicHashtags?: string[];
  };
  suggestedPrice: { min: number; max: number; reasoning: string };
  hashtags: string[];
  category_suggestion: string;
  subcategory_suggestion: string;
  tips: string[];
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const StudioFlow = ({ onBack }: { onBack: () => void }) => {
  const [step, setStep] = useState<StudioStep>("category");
  const [categoria, setCategoria] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [visionReport, setVisionReport] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<QuestionAnswer[]>([]);
  const [outputData, setOutputData] = useState<StudioOutputData | null>(null);
  const [missingAngles, setMissingAngles] = useState<string[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  /* ── helpers ── */

  const parseMissingAngles = (report: string): string[] => {
    try {
      const jsonMatch = report.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.missingAngles || [];
      }
    } catch {}
    return [];
  };

  /* ── step handlers ── */

  const handleCategorySelect = (cat: string) => {
    setCategoria(cat);
    setStep("photos");
  };

  const handlePhotosComplete = useCallback(
    async (files: File[]) => {
      setImages(files);

      if (files.length === 0) {
        setStep("questions");
        return;
      }

      setStep("vision-loading");

      try {
        const imageDataUrls = await Promise.all(files.map((f) => fileToDataUrl(f)));

        const { data, error } = await supabase.functions.invoke("safelist-studio", {
          body: { action: "vision", categoria, images: imageDataUrls },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        const report = data?.visionReport || null;
        setVisionReport(report);

        if (report) {
          setMissingAngles(parseMissingAngles(report));
          setStep("vision-confirm");
        } else {
          setStep("questions");
        }
      } catch (err: any) {
        console.error("Vision error:", err);
        toast({
          title: "Analisi foto",
          description: "Procedo senza analisi visiva. Le domande saranno basate sulla categoria.",
        });
        setStep("questions");
      }
    },
    [categoria],
  );

  const handleVisionConfirm = () => {
    setStep("questions");
  };

  /* ── mid-flow photo addition ── */

  const handleAddPhotos = () => photoInputRef.current?.click();

  const handleNewPhotosAdded = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = e.target.files;
    if (!newFiles || newFiles.length === 0) return;

    const allImages = [...images, ...Array.from(newFiles)].slice(0, 15);
    setImages(allImages);
    setStep("vision-loading");

    try {
      const imageDataUrls = await Promise.all(allImages.map((f) => fileToDataUrl(f)));
      const { data, error } = await supabase.functions.invoke("safelist-studio", {
        body: { action: "vision", categoria, images: imageDataUrls },
      });
      if (!error && data?.visionReport) {
        setVisionReport(data.visionReport);
        setMissingAngles(parseMissingAngles(data.visionReport));
      }
    } catch (err: any) {
      console.error("Re-vision error:", err);
    }

    setStep("questions");
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  /* ── questions & generation ── */

  const fetchQuestions = async (
    history: QuestionAnswer[],
    reportOverride?: string | null,
  ) => {
    const report = reportOverride !== undefined ? reportOverride : visionReport;
    try {
      const { data, error } = await supabase.functions.invoke("safelist-studio", {
        body: {
          action: "questions",
          categoria,
          visionReport: report,
          conversationHistory: history,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.complete) {
        await generateOutput(history);
      } else {
        setConversationHistory(history);
        setStep("questions");
        return data;
      }
      return data;
    } catch (err: any) {
      console.error("Questions error:", err);
      toast({
        title: "Errore",
        description: err.message || "Errore nella generazione delle domande.",
        variant: "destructive",
      });
      setStep("photos");
      return null;
    }
  };

  const handleQuestionsSubmit = async (newAnswers: QuestionAnswer[]) => {
    const updatedHistory = [...conversationHistory, ...newAnswers];
    setStep("generating");
    await fetchQuestions(updatedHistory);
  };

  const handleRequestGenerate = async () => {
    setStep("generating");
    await generateOutput(conversationHistory);
  };

  const generateOutput = async (allAnswers: QuestionAnswer[]) => {
    setStep("generating");

    try {
      const { data, error } = await supabase.functions.invoke("safelist-studio", {
        body: {
          action: "generate",
          categoria,
          visionReport,
          questionsAnswers: allAnswers,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.output) {
        setOutputData(data.output);
        setConversationHistory(allAnswers);
        setStep("output");
        saveCreation(data.output, allAnswers).catch((err) =>
          console.error("Failed to save creation:", err),
        );
      }
    } catch (err: any) {
      console.error("Generate error:", err);
      toast({
        title: "Errore generazione",
        description: err.message || "Errore nella generazione dell'annuncio.",
        variant: "destructive",
      });
      setStep("questions");
    }
  };

  const saveCreation = async (output: StudioOutputData, answers: QuestionAnswer[]) => {
    let firstImageUrl: string | null = null;

    if (images.length > 0) {
      const file = images[0];
      const fileName = `studio-${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("analysis-images")
        .upload(fileName, file);

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from("analysis-images")
          .getPublicUrl(uploadData.path);
        firstImageUrl = urlData.publicUrl;
      }
    }

    await supabase.from("studio_creations").insert([
      {
        categoria,
        images: images.map((f) => f.name),
        vision_report: visionReport,
        questions_answers: answers as any,
        output: output as any,
        first_image_url: firstImageUrl,
        titolo_generato: output.titolo,
      },
    ]);
  };

  const handleNewCreation = () => {
    setStep("category");
    setCategoria("");
    setImages([]);
    setVisionReport(null);
    setConversationHistory([]);
    setOutputData(null);
    setMissingAngles([]);
  };

  const getBackAction = () => {
    switch (step) {
      case "photos":
        return () => setStep("category");
      case "vision-confirm":
        return () => setStep("photos");
      case "questions":
        return () => setStep("photos");
      default:
        return onBack;
    }
  };

  /* ── render ── */

  return (
    <div className="max-w-2xl mx-auto pt-2">
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleNewPhotosAdded}
      />

      {!["vision-loading", "generating", "output", "category"].includes(step) && (
        <Button
          variant="ghost"
          className="mb-6 text-muted-foreground hover:text-foreground"
          onClick={getBackAction()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Indietro
        </Button>
      )}

      {step === "category" && (
        <CategorySelector onSelect={handleCategorySelect} selected={categoria} />
      )}

      {step === "photos" && (
        <PhotoUploader categoria={categoria} onComplete={handlePhotosComplete} />
      )}

      {step === "vision-loading" && (
        <SmartLoader
          title="Analisi visiva in corso..."
          messages={[
            "Ispeziono qualità e dettagli delle foto…",
            "Identifico prodotto, brand e materiali…",
            "Verifico angolazioni e copertura…",
            "Sintetizzo il report visivo…",
          ]}
        />
      )}

      {step === "vision-confirm" && visionReport && (
        <VisionConfirmation visionReport={visionReport} onConfirm={handleVisionConfirm} />
      )}

      {step === "questions" && (
        <DynamicQuestions
          categoria={categoria}
          visionReport={visionReport}
          conversationHistory={conversationHistory}
          onSubmit={handleQuestionsSubmit}
          onSkipToGenerate={handleRequestGenerate}
          missingAngles={missingAngles}
          onAddPhotos={handleAddPhotos}
        />
      )}

      {step === "generating" && <SmartLoader title="Creo il tuo annuncio perfetto…" />}

      {step === "output" && outputData && (
        <StudioOutput data={outputData} onNew={handleNewCreation} onBack={onBack} />
      )}
    </div>
  );
};

export default StudioFlow;
