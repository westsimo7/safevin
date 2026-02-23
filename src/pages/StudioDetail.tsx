import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Copy, Check, PenTool, Tag, Euro, Lightbulb } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import TrustConversionSection from "@/components/studio/TrustConversionSection";

interface StudioRecord {
  id: string;
  categoria: string;
  images: any;
  vision_report: string | null;
  questions_answers: any;
  output: any;
  first_image_url: string | null;
  titolo_generato: string | null;
  created_at: string;
}

const CopyBtn = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-muted transition-colors active:scale-95">
      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
    </button>
  );
};

const StudioDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [record, setRecord] = useState<StudioRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("studio_creations")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) setRecord(data as StudioRecord);
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-6 py-12 text-center text-muted-foreground">Caricamento...</main>
      </div>
    );
  }

  if (!record || !record.output) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-6 py-12 text-center">
          <p className="text-muted-foreground mb-4">Annuncio non trovato.</p>
          <Button variant="ghost" onClick={() => navigate("/storico")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna allo Storico
          </Button>
        </main>
      </div>
    );
  }

  const output = record.output;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-6 py-12 max-w-2xl">
        {!isMobile && (
          <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground" onClick={() => navigate("/storico")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna allo Storico
          </Button>
        )}

        {/* Images */}
        {record.first_image_url && (
          <div className="mb-6 rounded-xl overflow-hidden">
            <img src={record.first_image_url} alt="Prodotto" className="w-full h-48 object-cover" />
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <PenTool className="w-5 h-5 text-primary" />
            <p className="text-xs text-muted-foreground">
              Creato il {new Date(record.created_at).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}
              {" · "}{record.categoria}
            </p>
          </div>

          {/* Titolo */}
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Titolo</p>
                <CopyBtn text={output.titolo || ""} />
              </div>
              <p className="text-lg font-bold">{output.titolo}</p>
            </CardContent>
          </Card>

          {/* Descrizione */}
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Descrizione</p>
                <CopyBtn text={output.descrizione || ""} />
              </div>
              <p className="text-sm whitespace-pre-line leading-relaxed">{output.descrizione}</p>
            </CardContent>
          </Card>

          {/* Bullet points */}
          {output.bulletPoints?.length > 0 && (
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dettagli</p>
                  <CopyBtn text={output.bulletPoints.join("\n")} />
                </div>
                <ul className="space-y-1.5">
                  {output.bulletPoints.map((bp: string, i: number) => (
                    <li key={i} className="text-sm">{bp}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Hashtags */}
          {output.hashtags?.length > 0 && (
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary" />
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hashtag</p>
                  </div>
                  <CopyBtn text={output.hashtags.join(" ")} />
                </div>
                <p className="text-sm text-primary">{output.hashtags.join(" ")}</p>
              </CardContent>
            </Card>
          )}

          {/* Price */}
          {output.suggestedPrice && (
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Euro className="w-4 h-4 text-primary" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Prezzo suggerito</p>
                </div>
                <p className="text-2xl font-bold">€{output.suggestedPrice.min} – €{output.suggestedPrice.max}</p>
                <p className="text-xs text-muted-foreground mt-1">{output.suggestedPrice.reasoning}</p>
              </CardContent>
            </Card>
          )}

          {/* Trust & Conversion Section — before tips */}
          {output.trustSection && (
            <TrustConversionSection data={output.trustSection} />
          )}

          {/* Legacy fallback */}
          {!output.trustSection && output.trustElements?.length > 0 && (
            <TrustConversionSection
              data={{
                buyerQuestions: [],
                actionChecklist: output.trustElements,
                strategicScripts: [],
              }}
            />
          )}

          {/* Tips */}
          {output.tips?.length > 0 && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider">Consigli</p>
                </div>
                <ul className="space-y-2">
                  {output.tips.map((tip: string, i: number) => (
                    <li key={i} className="text-sm">→ {tip}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4">
            <Button variant="neon" size="lg" className="w-full" onClick={() => navigate("/dashboard")}>
              Crea nuovo annuncio
            </Button>
            <Button variant="glass" className="w-full" onClick={() => navigate("/storico")}>
              Torna allo Storico
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudioDetail;
