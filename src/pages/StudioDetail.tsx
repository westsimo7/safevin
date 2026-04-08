import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppNavbar from "@/components/AppNavbar";
import PageTitle from "@/components/PageTitle";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import StudioOutput, { type StudioGeneratedOutput } from "@/components/studio/StudioOutput";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

const StudioDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  useSwipeBack("/storico");

  const [creation, setCreation] = useState<{
    titolo_generato: string | null;
    first_image_url: string | null;
    output: StudioGeneratedOutput | null;
    created_at: string;
    categoria: string;
    origin: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreation = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("studio_creations")
        .select("titolo_generato, first_image_url, output, created_at, categoria, origin")
        .eq("id", id)
        .single();

      if (!error && data) {
        setCreation(data as any);
      }
      setLoading(false);
    };
    fetchCreation();
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

  if (!creation) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavbar />
        <main className="container mx-auto px-6 py-12 text-center">
          <p className="text-muted-foreground mb-4">Creazione non trovata.</p>
          <PageTitle title="Storico" backTo="/storico" />
        </main>
      </div>
    );
  }

  if (!creation.output) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavbar />
        <main className="container mx-auto px-6 py-12 text-center">
          <p className="text-muted-foreground mb-4">Output non disponibile per questa creazione.</p>
          <PageTitle title="Storico" backTo="/storico" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="container mx-auto px-4 md:px-6 pt-4 md:pt-8 pb-12 max-w-2xl">
        <div className="text-center mb-6">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-2">
            <History className="w-3 h-3 mr-1" />
            Studio · {formatDate(creation.created_at)}
          </Badge>
          <PageTitle
            title={creation.titolo_generato || "Creazione Studio"}
            backTo="/storico"
            className="text-center"
          />
        </div>

        {creation.first_image_url && (
          <div className="w-20 h-20 rounded-xl overflow-hidden mx-auto mb-6 border border-border/40">
            <img src={creation.first_image_url} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        <StudioOutput
          output={creation.output}
          onNewAnalysis={() => navigate("/engine/studio")}
          onBack={() => navigate("/storico")}
        />
      </main>
    </div>
  );
};

export default StudioDetail;
