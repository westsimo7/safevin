import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppNavbar from "@/components/AppNavbar";
import PageTitle from "@/components/PageTitle";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import AuditResult, { type AuditResultData } from "@/components/AuditResult";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

const StoricoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState<{
    titolo: string;
    first_image_url: string | null;
    analysis_result: AuditResultData;
    created_at: string;
    origin: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("analyses")
        .select("titolo, first_image_url, analysis_result, created_at, origin")
        .eq("id", id)
        .single();

      if (!error && data) {
        setAnalysis(data as any);
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
      <main className="container mx-auto px-4 md:px-6 pt-4 md:pt-8 pb-12 max-w-2xl">
        <Button
          variant="ghost"
          className="mb-6 text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/storico")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Torna allo Storico
        </Button>

        <div className="text-center mb-6">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-2">
            <History className="w-3 h-3 mr-1" />
            Audit · {formatDate(analysis.created_at)}
          </Badge>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-1">
            {analysis.titolo || "Senza titolo"}
          </h1>
          {analysis.origin === "studio" && (
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] mt-1">
              +5% Qualità Studio
            </Badge>
          )}
        </div>

        {analysis.first_image_url && (
          <div className="w-20 h-20 rounded-xl overflow-hidden mx-auto mb-6 border border-border/40">
            <img src={analysis.first_image_url} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        <AuditResult result={analysis.analysis_result} />
      </main>
    </div>
  );
};

export default StoricoDetail;
