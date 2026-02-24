import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppNavbar from "@/components/AppNavbar";
import EngineAnalysisCard from "@/components/EngineAnalysisCard";
import AnalysisSummary from "@/components/AnalysisSummary";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Image as ImageIcon, Camera, Sparkles, CheckCircle, AlertTriangle, Wand2 } from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// AnalysisRecord interface
interface AnalysisRecord {
  id: string;
  titolo: string;
  descrizione: string;
  categoria: string;
  prezzo: string;
  brand: string;
  condizioni: string;
  taglia: string;
  colore: string;
  tempo_caricamento: string;
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
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("analyses")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        setAnalysis(data as unknown as AnalysisRecord);
      }
      setLoading(false);
    };
    fetchAnalysis();
  }, [id]);

  const getScoreColor = (score: number, max: number) => {
    const pct = max > 0 ? (score / max) * 100 : 0;
    if (pct >= 70) return "text-green-500";
    if (pct >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 7) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (score >= 4) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <AlertTriangle className="w-4 h-4 text-red-500" />;
  };

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

  const result = analysis.analysis_result;
  const isImageOnly = (analysis.analysis_type || "full") === "image_only";

  // Dynamic SafeScore for image analysis: sum of scores / (numImages * 10)
  const getImageSafeScore = () => {
    const photoReports = result?.photoReports || [];
    const numImages = photoReports.length || 1;
    const totalScore = photoReports.reduce((sum: number, r: any) => sum + (r.score || 0), 0);
    const maxScore = numImages * 10;
    return { score: totalScore, max: maxScore };
  };

  // ─── IMAGE ONLY DETAIL ───
  if (isImageOnly) {
    const photoReports = result?.photoReports || [];
    const { score: imageScore, max: imageMax } = getImageSafeScore();
    const pct = imageMax > 0 ? Math.round((imageScore / imageMax) * 100) : 0;

    return (
      <div className="min-h-screen bg-background">
        <AppNavbar />
        <main className="container mx-auto px-6 py-8 max-w-4xl">
          <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground" onClick={() => navigate("/storico")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna allo Storico
          </Button>

          {/* Header */}
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 mb-6">
            <CardContent className="py-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {new Date(analysis.created_at).toLocaleDateString("it-IT", {
                      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                  <h1 className="text-xl font-bold flex items-center gap-2">
                    <Camera className="w-5 h-5 text-primary" />
                    {analysis.titolo || "Analisi Immagini"}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">{photoReports.length} foto analizzate</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">SafeViN Score</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-4xl font-black ${getScoreColor(imageScore, imageMax)}`}>{imageScore}</span>
                    <span className="text-lg text-muted-foreground">/ {imageMax}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{pct}% del potenziale</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image grid */}
          {analysis.first_image_url && (
            <Card className="border-border/50 mb-6">
              <CardContent className="py-5">
                <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  Immagini analizzate
                </h2>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  <div
                    className="aspect-square rounded-lg overflow-hidden border border-border/50 cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => setPreviewImage(analysis.first_image_url)}
                  >
                    <img src={analysis.first_image_url} alt="Foto 1" className="w-full h-full object-cover" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Full report */}
          <Card className="border-border/50 mb-6">
            <CardContent className="py-5">
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Resoconto analisi
              </h2>

              {photoReports.length > 0 ? (
                <Accordion type="multiple" defaultValue={photoReports.map((_: any, i: number) => `photo-${i}`)} className="space-y-3">
                  {photoReports.map((photo: any, i: number) => (
                    <AccordionItem key={i} value={`photo-${i}`} className="border border-border/50 rounded-xl overflow-hidden bg-card/50">
                      <AccordionTrigger className="px-5 py-4 hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                          <div className="flex-1">
                            <span className="font-semibold text-sm">Foto {photo.photoIndex || i + 1}</span>
                          </div>
                          {getScoreIcon(photo.score)}
                          <span className="text-sm font-bold">{photo.score}/10</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-5 pb-5">
                        <div className="space-y-4">
                          {photo.problems?.length > 0 && (
                            <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                              <p className="text-xs font-semibold text-destructive uppercase tracking-wider mb-2">Problemi</p>
                              <ul className="space-y-1.5">
                                {photo.problems.map((p: string, j: number) => (
                                  <li key={j} className="flex items-start gap-2 text-sm text-foreground/80">
                                    <span className="text-destructive mt-0.5">•</span>
                                    <span>{p}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {photo.solutions?.length > 0 && (
                            <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                              <p className="text-xs font-semibold text-green-500 uppercase tracking-wider mb-2">Come risolvere</p>
                              <ul className="space-y-1.5">
                                {photo.solutions.map((s: string, j: number) => (
                                  <li key={j} className="flex items-start gap-2 text-sm text-foreground/80">
                                    <span className="text-green-500 mt-0.5">✓</span>
                                    <span>{s}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-sm text-muted-foreground">Nessun report dettagliato disponibile.</p>
              )}
            </CardContent>
          </Card>

          <Button variant="ghost" className="w-full" onClick={() => navigate("/storico")}>
            Torna allo Storico
          </Button>

          <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
            <DialogContent className="max-w-2xl p-2 bg-card border-border">
              {previewImage && <img src={previewImage} alt="Preview" className="w-full rounded-lg" />}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    );
  }

  // ─── FULL AUDIT DETAIL ───
  const fields = [
    { label: "Titolo", value: analysis.titolo },
    { label: "Descrizione", value: analysis.descrizione },
    { label: "Categoria", value: analysis.categoria },
    { label: "Prezzo", value: analysis.prezzo },
    { label: "Brand", value: analysis.brand },
    { label: "Condizioni", value: analysis.condizioni },
    { label: "Taglia", value: analysis.taglia },
    { label: "Colore", value: analysis.colore },
    { label: "Tempo caricamento", value: analysis.tempo_caricamento },
  ];

  const totalScore = result?.sections?.reduce((sum: number, s: any) => sum + (s.score || 0), 0) ?? result?.overallScore ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground" onClick={() => navigate("/storico")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Torna allo Storico
        </Button>

        <Card className="border-border/50 mb-8">
          <CardContent className="py-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              Dati dell'annuncio sottoposto ad Audit
            </h2>

            {analysis.first_image_url && (
              <div className="mb-4 rounded-lg overflow-hidden max-w-xs">
                <img src={analysis.first_image_url} alt={analysis.titolo || "Immagine annuncio"} className="w-full h-48 object-cover" />
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {fields.map(field =>
                field.value ? (
                  <div key={field.label} className="p-3 rounded-lg bg-muted/30 border border-border/30 w-fit max-w-full">
                    <p className="text-xs text-muted-foreground mb-1">{field.label}</p>
                    <p className="text-sm text-foreground whitespace-pre-line break-words">{field.value}</p>
                  </div>
                ) : null
              )}
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Analizzato il{" "}
              {new Date(analysis.created_at).toLocaleDateString("it-IT", {
                day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-8">
            <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
              <CardContent className="py-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">SafeScore™ Globale</p>
                    <div className="flex items-center gap-4">
                      <span className={`text-6xl font-black ${getScoreColor(totalScore, 100)}`}>{totalScore}</span>
                      <span className="text-2xl text-muted-foreground">/100</span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      {totalScore >= 70 ? "Ottimo potenziale" : totalScore >= 40 ? "Margine di miglioramento" : "Necessita ottimizzazione"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              {result.sections?.map((section: any, index: number) => (
                <EngineAnalysisCard key={index} section={section} />
              ))}
            </div>

            {result.summary && <AnalysisSummary summary={result.summary} />}

            <Button
              variant="neon"
              size="lg"
              className="w-full group text-lg h-14"
              onClick={() => navigate("/engine/improve", {
                state: { auditSections: result.sections, listingData: analysis, totalScore },
              })}
            >
              <Wand2 className="w-5 h-5 mr-2" />
              Migliora questo annuncio con SafeViN Studio
            </Button>

            <div className="text-center pt-4">
              <Button variant="ghost" onClick={() => navigate("/storico")}>
                Torna allo Storico
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StoricoDetail;
