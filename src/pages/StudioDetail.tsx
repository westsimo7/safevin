import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Copy, Check, PenTool, Euro, Lightbulb, Type, FileText, List, FolderOpen, Sparkles } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import TrustConversionSection from "@/components/studio/TrustConversionSection";
import KeywordIntelligence from "@/components/studio/KeywordIntelligence";

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

        <div className="space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <PenTool className="w-5 h-5 text-primary" />
            <p className="text-xs text-muted-foreground">
              Creato il {new Date(record.created_at).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}
              {" · "}{record.categoria}
            </p>
          </div>

          {/* Titolo */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Type className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-base font-bold tracking-tight">Titolo</h3>
                </div>
                <CopyBtn text={output.titolo || ""} />
              </div>
              <div className="border-t border-primary/10 pt-3">
                <p className="text-lg font-normal leading-snug">{output.titolo}</p>
              </div>
            </CardContent>
          </Card>

          {/* Descrizione */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-base font-bold tracking-tight">Descrizione</h3>
                </div>
                <CopyBtn text={output.descrizione || ""} />
              </div>
              <div className="border-t border-primary/10 pt-3">
                <p className="text-sm whitespace-pre-line leading-relaxed text-foreground/90">{output.descrizione}</p>
              </div>
            </CardContent>
          </Card>

          {/* Dettagli tecnici */}
          {output.bulletPoints?.length > 0 && (
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                      <List className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Dettagli tecnici</p>
                  </div>
                  <CopyBtn text={output.bulletPoints.join("\n")} />
                </div>
                <div className="border-t border-primary/10 pt-3">
                  <ul className="space-y-1.5">
                    {output.bulletPoints.map((bp: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                        <span className="text-primary/60 mt-0.5">•</span>
                        <span>{bp.replace(/^•\s*/, "")}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prezzo suggerito */}
          {output.suggestedPrice && (
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                    <Euro className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Prezzo suggerito</p>
                </div>
                <div className="border-t border-primary/10 pt-3">
                  <p className="text-3xl font-bold tracking-tight">
                    €{output.suggestedPrice.min} <span className="text-muted-foreground font-normal text-lg">–</span> €{output.suggestedPrice.max}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{output.suggestedPrice.reasoning}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Categoria consigliata */}
          {(output.category_suggestion || output.subcategory_suggestion) && (
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                    <FolderOpen className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Categoria consigliata</p>
                </div>
                <div className="border-t border-primary/10 pt-3">
                  <p className="text-sm font-medium">
                    {output.category_suggestion}
                    {output.subcategory_suggestion && <span className="text-muted-foreground"> → </span>}
                    {output.subcategory_suggestion}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Keyword Intelligence */}
          {output.keywordIntelligence ? (
            <KeywordIntelligence data={output.keywordIntelligence} legacyHashtags={output.hashtags} />
          ) : output.hashtags?.length > 0 ? (
            <KeywordIntelligence data={{}} legacyHashtags={output.hashtags} />
          ) : null}

          {/* Trust & Conversion */}
          {output.trustSection && (
            <TrustConversionSection data={output.trustSection} />
          )}
          {!output.trustSection && output.trustElements?.length > 0 && (
            <TrustConversionSection
              data={{ buyerQuestions: [], actionChecklist: output.trustElements, strategicScripts: [] }}
            />
          )}

          {/* Consigli */}
          {output.tips?.length > 0 && (
            <Card className="border-primary/20 bg-primary/5 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider">Consigli extra</p>
                </div>
                <ul className="space-y-2">
                  {output.tips.map((tip: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="text-primary mt-0.5">→</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4">
            <Button variant="neon" size="lg" className="w-full" onClick={() => navigate("/dashboard")}>
              <Sparkles className="w-4 h-4 mr-2" />
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
