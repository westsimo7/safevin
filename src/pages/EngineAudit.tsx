import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import AuditWizard, { type AuditData } from "@/components/AuditWizard";
import AuditResult, { type AuditResultData } from "@/components/AuditResult";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const EngineAudit = () => {
  const navigate = useNavigate();
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [auditResult, setAuditResult] = useState<AuditResultData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleComplete = async (data: AuditData) => {
    setAuditData(data);
    setIsAnalyzing(true);

    try {
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

      setAuditResult(fnData.audit);
    } catch (err: any) {
      console.error("Audit error:", err);
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
            <div className="flex justify-center mt-8">
              <Button variant="outline" onClick={handleReset}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Analizza un altro annuncio
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default EngineAudit;
