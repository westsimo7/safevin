import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppNavbar from "@/components/AppNavbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface AnalysisRecord {
  id: string;
  titolo: string;
  first_image_url: string | null;
  analysis_result: any;
  created_at: string;
  analysis_type: string;
}

const StoricoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState<AnalysisRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("analyses")
        .select("id, titolo, first_image_url, analysis_result, created_at, analysis_type")
        .eq("id", id)
        .single();

      if (!error && data) {
        setAnalysis(data as unknown as AnalysisRecord);
      }
      setLoading(false);
    };
    fetchAnalysis();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavbar />
        <main className="container mx-auto px-6 py-12 text-center text-muted-foreground">
          Caricamento...
        </main>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavbar />
        <main className="container mx-auto px-6 py-12 text-center">
          <p className="text-muted-foreground mb-4">Analisi non trovata.</p>
          <Button variant="ghost" onClick={() => navigate("/storico")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna allo Storico
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="container mx-auto px-6 py-12 text-center">
        <p className="text-muted-foreground mb-4">Dettaglio audit non più disponibile. Nuova implementazione in arrivo.</p>
        <Button variant="ghost" onClick={() => navigate("/storico")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Torna allo Storico
        </Button>
      </main>
    </div>
  );
};

export default StoricoDetail;
