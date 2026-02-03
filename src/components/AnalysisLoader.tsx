import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

const analysisSteps = [
  "Connessione al server...",
  "Analisi SEO Titolo...",
  "Analisi Prime 3 Foto...",
  "Analisi Prezzo Mercato...",
  "Valutazione Descrizione...",
  "Controllo Tag e Categoria...",
  "Analisi Tempo di Risposta...",
  "Valutazione Attività Profilo...",
  "Controllo Ripubblicazione...",
  "Analisi Psicologia Compratore...",
  "Valutazione Volume Annunci...",
  "Calcolo Fiducia Finale...",
  "Generazione Report...",
];

interface AnalysisLoaderProps {
  isLoading: boolean;
}

const AnalysisLoader = ({ isLoading }: AnalysisLoaderProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      setCurrentStep(0);
      return;
    }

    // Progress animation - takes about 7 seconds to complete
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 3 + 1;
      });
    }, 150);

    // Step animation
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= analysisSteps.length - 1) return prev;
        return prev + 1;
      });
    }, 550);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      {/* Progress Bar */}
      <div className="w-full max-w-md mb-8">
        <div className="relative h-3 rounded-full overflow-hidden bg-muted">
          <div 
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{ 
              width: `${progress}%`,
              background: "linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(270 100% 60%) 100%)"
            }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm text-muted-foreground">{analysisSteps[currentStep]}</span>
          <span className="text-sm font-medium text-foreground">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Steps list */}
      <div className="space-y-2 w-full max-w-md">
        {analysisSteps.slice(0, currentStep + 1).map((step, index) => (
          <div 
            key={step}
            className={`flex items-center gap-3 text-sm transition-all duration-300 ${
              index === currentStep 
                ? "text-foreground" 
                : "text-muted-foreground/50"
            }`}
            style={{ 
              animationDelay: `${index * 50}ms`,
              opacity: index === currentStep ? 1 : 0.5
            }}
          >
            <div className={`w-2 h-2 rounded-full ${
              index < currentStep 
                ? "bg-green-500" 
                : index === currentStep 
                ? "bg-primary animate-pulse" 
                : "bg-muted"
            }`} />
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisLoader;
