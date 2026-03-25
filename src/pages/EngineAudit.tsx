import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Loader2, Sparkles } from "lucide-react";
import AuditWizard, { type AuditData } from "@/components/AuditWizard";
import AuditResult, { type AuditResultData } from "@/components/AuditResult";
import AlreadyAnalyzedDialog from "@/components/AlreadyAnalyzedDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/** Simple fingerprint from audit text fields for duplicate detection */
const buildFingerprint = (d: AuditData) =>
  [d.titolo, d.descrizione, d.prezzo, d.brand, d.condizioni, d.categoria]
    .map(s => (s || "").trim().toLowerCase())
    .join("|");

/** Jaccard-like similarity on words (0-1) */
const textSimilarity = (a: string, b: string): number => {
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter(Boolean));
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter(Boolean));
  if (wordsA.size === 0 && wordsB.size === 0) return 1;
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let inter = 0;
  wordsA.forEach(w => { if (wordsB.has(w)) inter++; });
  return inter / Math.max(wordsA.size, wordsB.size);
};

/** Apply +5% Studio bonus to each category (capped at 100) */
const applyStudioBonus = (result: AuditResultData): AuditResultData => {
  const cats = { ...result.categories };
  for (const key of Object.keys(cats) as (keyof typeof cats)[]) {
    cats[key] = { ...cats[key], score: Math.min(100, Math.round(cats[key].score * 1.05)) };
  }
  // Recalculate safeScore with weights
  const weighted =
    cats.attenzione.score * 0.25 +
    cats.chiarezza.score * 0.25 +
    cats.valore.score * 0.20 +
    cats.fiducia.score * 0.15 +
    cats.immagini.score * 0.15;
  return { ...result, categories: cats, safeScore: Math.min(100, Math.round(weighted)) };
};

const EngineAudit = () => {
  const navigate = useNavigate();
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [auditResult, setAuditResult] = useState<AuditResultData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [duplicateResult, setDuplicateResult] = useState<AuditResultData | null>(null);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);

  const saveToHistory = async (data: AuditData, result: AuditResultData, origin: string, studioCreationId?: string) => {
    try {
      await supabase.from("analyses").insert([{
        titolo: data.titolo || "",
        descrizione: data.descrizione || "",
        categoria: data.categoria || "",
        brand: data.brand || "",
        prezzo: data.prezzo || "",
        condizioni: data.condizioni || "",
        first_image_url: data.imagePreviews?.[0] || null,
        analysis_result: result as any,
        analysis_type: "full",
        origin,
        ...(studioCreationId ? { studio_creation_id: studioCreationId } : {}),
      }]);
    } catch (err) {
      console.error("Failed to save audit to history:", err);
    }
  };

  const handleComplete = async (data: AuditData) => {
    setAuditData(data);
    setIsAnalyzing(true);

    try {
      // ===== DUPLICATE / SIMILARITY CHECK =====
      const fp = buildFingerprint(data);
      const { data: pastAnalyses } = await supabase
        .from("analyses")
        .select("titolo, descrizione, prezzo, brand, condizioni, categoria, analysis_result, origin, studio_creation_id")
        .eq("analysis_type", "full")
        .order("created_at", { ascending: false })
        .limit(50);

      if (pastAnalyses && pastAnalyses.length > 0) {
        for (const past of pastAnalyses) {
          const pastFp = [past.titolo, past.descrizione, past.prezzo, past.brand, past.condizioni, past.categoria]
            .map(s => (s || "").trim().toLowerCase())
            .join("|");

          if (pastFp === fp) {
            // Exact duplicate — return cached result
            let cached = past.analysis_result as unknown as AuditResultData;
            if (past.origin === "studio" || past.studio_creation_id) {
              cached = applyStudioBonus(cached);
            }
            setDuplicateResult(cached);
            setShowDuplicateDialog(true);
            setIsAnalyzing(false);
            return;
          }
        }

        // Check for 70%+ similarity — pass previous context to AI
        const combinedText = `${data.titolo} ${data.descrizione}`;
        let bestMatch: typeof pastAnalyses[0] | null = null;
        let bestSim = 0;
        for (const past of pastAnalyses) {
          const pastText = `${past.titolo} ${past.descrizione}`;
          const sim = textSimilarity(combinedText, pastText);
          if (sim > bestSim) { bestSim = sim; bestMatch = past; }
        }

        // If 70%+ similar, pass previous result as context
        const similarContext = bestSim >= 0.7 && bestMatch ? {
          previousResult: bestMatch.analysis_result,
          similarity: Math.round(bestSim * 100),
        } : undefined;

        const { data: fnData, error } = await supabase.functions.invoke("safelist-analyze", {
          body: {
            auditData: {
              titolo: data.titolo,
              descrizione: data.descrizione,
              categoria: data.categoria,
              brand: data.brand,
              prezzo: data.prezzo,
              condizioni: data.condizioni,
              isPubblicato: data.isPubblicato,
              tempoOnline: data.tempoOnline,
              imagePreviews: data.imagePreviews,
            },
            similarContext,
          },
        });

        if (error) throw error;
        if (fnData?.error) throw new Error(fnData.error);

        let result: AuditResultData = fnData.audit;

        // ===== STUDIO BONUS: detect if listing comes from Studio =====
        const isFromStudio = await checkIfFromStudio(data);
        if (isFromStudio) {
          result = applyStudioBonus(result);
        }

        setAuditResult(result);
        await saveToHistory(data, result, isFromStudio ? "studio" : "external");
      } else {
        // No past analyses — fresh call
        const { data: fnData, error } = await supabase.functions.invoke("safelist-analyze", {
          body: {
            auditData: {
              titolo: data.titolo,
              descrizione: data.descrizione,
              categoria: data.categoria,
              brand: data.brand,
              prezzo: data.prezzo,
              condizioni: data.condizioni,
              isPubblicato: data.isPubblicato,
              tempoOnline: data.tempoOnline,
              imagePreviews: data.imagePreviews,
            },
          },
        });

        if (error) throw error;
        if (fnData?.error) throw new Error(fnData.error);

        let result: AuditResultData = fnData.audit;

        const isFromStudio = await checkIfFromStudio(data);
        if (isFromStudio) {
          result = applyStudioBonus(result);
        }

        setAuditResult(result);
        await saveToHistory(data, result, isFromStudio ? "studio" : "external");
      }
    } catch (err: any) {
      console.error("Audit error:", err);
      toast.error(err?.message || "Errore durante l'analisi. Riprova.");
      setAuditData(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /** Check if the listing title/description match a Studio creation */
  const checkIfFromStudio = async (data: AuditData): Promise<boolean> => {
    try {
      const { data: studioMatches } = await supabase
        .from("studio_creations")
        .select("id, titolo_generato")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!studioMatches) return false;

      for (const sc of studioMatches) {
        if (sc.titolo_generato && data.titolo) {
          const sim = textSimilarity(sc.titolo_generato, data.titolo);
          if (sim >= 0.7) return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleUseDuplicate = () => {
    if (duplicateResult) {
      setAuditResult(duplicateResult);
      setShowDuplicateDialog(false);
      setDuplicateResult(null);
    }
  };

  const handleForceReanalyze = async () => {
    setShowDuplicateDialog(false);
    setDuplicateResult(null);
    if (!auditData) return;

    setIsAnalyzing(true);
    try {
      const { data: fnData, error } = await supabase.functions.invoke("safelist-analyze", {
        body: {
          auditData: {
            titolo: auditData.titolo,
            descrizione: auditData.descrizione,
            categoria: auditData.categoria,
            brand: auditData.brand,
            prezzo: auditData.prezzo,
            condizioni: auditData.condizioni,
            isPubblicato: auditData.isPubblicato,
            tempoOnline: auditData.tempoOnline,
            imagePreviews: auditData.imagePreviews,
          },
        },
      });
      if (error) throw error;
      if (fnData?.error) throw new Error(fnData.error);

      let result: AuditResultData = fnData.audit;
      const isFromStudio = await checkIfFromStudio(auditData);
      if (isFromStudio) result = applyStudioBonus(result);

      setAuditResult(result);
      await saveToHistory(auditData, result, isFromStudio ? "studio" : "external");
    } catch (err: any) {
      console.error("Re-audit error:", err);
      toast.error(err?.message || "Errore durante l'analisi. Riprova.");
      setAuditData(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAuditData(null);
    setAuditResult(null);
  };

  const handleImproveWithStudio = () => {
    if (!auditData || !auditResult) return;

    navigate("/engine/studio", {
      state: {
        fromAudit: true,
        auditSource: {
          titolo: auditData.titolo,
          descrizione: auditData.descrizione,
          categoria: auditData.categoria,
          brand: auditData.brand,
          prezzo: auditData.prezzo,
          condizioni: auditData.condizioni,
          imagePreviews: auditData.imagePreviews,
          deepIssues: auditResult.deepIssues || [],
          safeScore: auditResult.safeScore,
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="container mx-auto px-4 md:px-6 pt-4 md:pt-8 pb-12">
        <Button
          variant="ghost"
          className="hidden md:inline-flex mb-6 text-muted-foreground hover:text-foreground"
          onClick={() => auditResult ? handleReset() : navigate("/engine/analyze")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {auditResult ? "Nuova analisi" : "Tipo analisi"}
        </Button>

        <div className="text-center mb-6 md:mb-10">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-2 md:mb-4">
            <Search className="w-3 h-3 mr-1" />
            Audit Completo
          </Badge>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-1">
            {auditResult ? "Risultato Audit" : "Analizza il tuo annuncio"}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {auditResult
              ? "Ecco come si posiziona il tuo annuncio"
              : "Inserisci i dati esatti del tuo annuncio, uno alla volta"}
          </p>
        </div>

        {!auditData && !isAnalyzing && !auditResult && (
          <AuditWizard onComplete={handleComplete} />
        )}

        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analisi in corso...</p>
          </div>
        )}

        {auditResult && (
          <>
            <AuditResult result={auditResult} />
            <div className="flex flex-col items-center gap-3 mt-8">
              {auditResult.safeScore <= 74 && (
                <Button
                  onClick={handleImproveWithStudio}
                  className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Migliora con Studio
                </Button>
              )}
              <Button variant="outline" onClick={handleReset}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Analizza un altro annuncio
              </Button>
            </div>
          </>
        )}
      </main>

      <AlreadyAnalyzedDialog
        open={showDuplicateDialog}
        onOpenChange={setShowDuplicateDialog}
        onUseCached={handleUseDuplicate}
        onReanalyze={handleForceReanalyze}
      />
    </div>
  );
};

export default EngineAudit;
