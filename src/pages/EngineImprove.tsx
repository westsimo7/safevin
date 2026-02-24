import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardHeader from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import StudioOutput from "@/components/studio/StudioOutput";
import StudioLoader from "@/components/studio/StudioLoader";

const EngineImprove = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [outputData, setOutputData] = useState<any>(null);

  const { auditSections, listingData, totalScore } = (location.state || {}) as any;

  useEffect(() => {
    if (!auditSections || !listingData) {
      toast({ title: "Dati mancanti", description: "Torna all'audit per generare il miglioramento.", variant: "destructive" });
      navigate("/engine/analyze/audit");
      return;
    }

    generateImprovement();
  }, []);

  const generateImprovement = async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("safelist-studio", {
        body: {
          action: "improve",
          auditSections,
          listingData: {
            titolo: listingData.titolo,
            descrizione: listingData.descrizione,
            categoria: listingData.categoria,
            prezzo: listingData.prezzo,
            brand: listingData.brand,
            condizioni: listingData.condizioni,
            taglia: listingData.taglia,
            colore: listingData.colore,
          },
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.output) {
        setOutputData(data.output);

        // Save to DB
        await supabase.from("studio_creations").insert([{
          categoria: listingData.categoria || "Miglioramento",
          questions_answers: [] as any,
          output: data.output as any,
          titolo_generato: data.output.titolo,
        }]);
      }
    } catch (err: any) {
      console.error("Improve error:", err);
      toast({ title: "Errore", description: err.message || "Errore durante il miglioramento.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-6 pt-8 pb-12 max-w-2xl">
        <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground" onClick={() => navigate("/engine/analyze/audit")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Torna all'Audit
        </Button>

        {isLoading && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">
                <Wand2 className="w-3 h-3 mr-1" />
                Ottimizzato da Audit + Studio
              </Badge>
              <h1 className="text-2xl font-bold">Miglioro il tuo annuncio...</h1>
            </div>
            <StudioLoader message="Applico le correzioni dell'Audit e genero l'annuncio migliorato..." />
          </div>
        )}

        {!isLoading && outputData && (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <Badge className="bg-green-500/10 text-green-500 border-green-500/30 mb-3">
                <Sparkles className="w-3 h-3 mr-1" />
                Ottimizzato da Audit + Studio
              </Badge>
            </div>
            <StudioOutput
              data={outputData}
              onNew={() => navigate("/engine")}
              onBack={() => navigate("/engine")}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default EngineImprove;
