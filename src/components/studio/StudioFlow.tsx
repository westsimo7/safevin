import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CategorySelector from "./CategorySelector";
import PhotoUploader from "./PhotoUploader";
import DynamicQuestions from "./DynamicQuestions";
import StudioOutput from "./StudioOutput";
import StudioLoader from "./StudioLoader";

export type StudioStep = "category" | "photos" | "questions" | "generating" | "output";

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
  const [loaderMessage, setLoaderMessage] = useState("");
  const { toast } = useToast();

  const handleCategorySelect = (cat: string) => {
    setCategoria(cat);
    setStep("photos");
  };

  const handlePhotosComplete = useCallback(async (files: File[]) => {
    setImages(files);
    let report: string | null = null;
    
    if (files.length > 0) {
      setStep("generating");
      setLoaderMessage("Analisi visiva in corso...");

      try {
        const imageDataUrls: string[] = [];
        for (const file of files) {
          imageDataUrls.push(await fileToDataUrl(file));
        }

        const { data, error } = await supabase.functions.invoke("safelist-studio", {
          body: { action: "vision", categoria, images: imageDataUrls },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        report = data?.visionReport || null;
        setVisionReport(report);
      } catch (err: any) {
        console.error("Vision error:", err);
        toast({
          title: "Analisi foto",
          description: "Procedo senza analisi visiva. Le domande saranno basate sulla categoria.",
        });
      }
    }

    // Move to questions - pass report directly to avoid stale state
    setStep("generating");
    setLoaderMessage("Preparo le domande per il tuo annuncio...");
    await fetchQuestions([], report);
  }, [categoria]);

  const fetchQuestions = async (history: QuestionAnswer[], reportOverride?: string | null) => {
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
        // Questions are stored in the DynamicQuestions component via the data
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
    setLoaderMessage("Analizzo le tue risposte...");

    const data = await fetchQuestions(updatedHistory);
    // If complete was returned, generateOutput was already called
  };

  const handleRequestGenerate = async () => {
    setStep("generating");
    setLoaderMessage("Creo il tuo annuncio perfetto...");
    await generateOutput(conversationHistory);
  };

  const generateOutput = async (allAnswers: QuestionAnswer[]) => {
    setStep("generating");
    setLoaderMessage("Costruzione strategica dell'annuncio...");

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

        // Save to DB in background
        saveCreation(data.output, allAnswers).catch(err =>
          console.error("Failed to save creation:", err)
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

    await supabase.from("studio_creations").insert([{
      categoria,
      images: images.map(f => f.name),
      vision_report: visionReport,
      questions_answers: answers as any,
      output: output as any,
      first_image_url: firstImageUrl,
      titolo_generato: output.titolo,
    }]);
  };

  const handleNewCreation = () => {
    setStep("category");
    setCategoria("");
    setImages([]);
    setVisionReport(null);
    setConversationHistory([]);
    setOutputData(null);
  };

  const getBackAction = () => {
    switch (step) {
      case "photos": return () => setStep("category");
      case "questions": return () => setStep("photos");
      default: return onBack;
    }
  };

  return (
    <div className="max-w-2xl mx-auto pt-2">
      {step !== "generating" && step !== "output" && step !== "category" && (
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
        <PhotoUploader
          categoria={categoria}
          onComplete={handlePhotosComplete}
        />
      )}

      {step === "generating" && (
        <StudioLoader message={loaderMessage} />
      )}

      {step === "questions" && (
        <DynamicQuestions
          categoria={categoria}
          visionReport={visionReport}
          conversationHistory={conversationHistory}
          onSubmit={handleQuestionsSubmit}
          onSkipToGenerate={handleRequestGenerate}
        />
      )}

      {step === "output" && outputData && (
        <StudioOutput
          data={outputData}
          onNew={handleNewCreation}
          onBack={onBack}
        />
      )}
    </div>
  );
};

export default StudioFlow;
