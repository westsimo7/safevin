import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Camera, ImagePlus, X, Sparkles, CheckCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AnalysisLoader from "@/components/AnalysisLoader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const MAX_IMAGES = 15;

interface PhotoReport {
  photoIndex: number;
  problems: string[];
  solutions: string[];
  score: number;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const EngineImageAnalysis = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<PhotoReport[] | null>(null);

  const addImages = useCallback((files: FileList | File[]) => {
    const newFiles = Array.from(files).filter(f => f.type.startsWith("image/")).slice(0, MAX_IMAGES - images.length);
    if (newFiles.length === 0) return;
    setImages(prev => [...prev, ...newFiles]);
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => setPreviews(prev => [...prev, e.target?.result as string]);
      reader.readAsDataURL(file);
    });
  }, [images.length]);

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (images.length === 0) {
      toast({ title: "Nessuna foto", description: "Carica almeno un'immagine.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setReport(null);

    try {
      const imageDataUrls: string[] = [];
      for (const file of images) {
        imageDataUrls.push(await fileToDataUrl(file));
      }

      const { data, error } = await supabase.functions.invoke("safelist-analyze", {
        body: { imageOnly: true, images: imageDataUrls },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.photoReports) {
        setReport(data.photoReports);

        // Save to DB
        let firstImageUrl: string | null = null;
        const file = images[0];
        const fileName = `img-${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from("analysis-images").upload(fileName, file);
        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage.from("analysis-images").getPublicUrl(uploadData.path);
          firstImageUrl = urlData.publicUrl;
        }

        await supabase.from("analyses").insert([{
          titolo: `Analisi ${images.length} immagini`,
          analysis_result: { photoReports: data.photoReports } as any,
          first_image_url: firstImageUrl,
          analysis_type: "image_only",
        }]);
      }
    } catch (err: any) {
      console.error("Image analysis error:", err);
      toast({ title: "Errore", description: err.message || "Errore durante l'analisi.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreIcon = (score: number) => {
    if (score >= 7) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (score >= 4) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <AlertTriangle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-6 pt-8 pb-12 max-w-3xl">
        <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground" onClick={() => navigate("/engine/analyze")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tipo analisi
        </Button>

        {!report && !isLoading && (
          <>
            <div className="text-center mb-8">
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
                <Camera className="w-3 h-3 mr-1" />
                Analisi Immagini
              </Badge>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Analisi foto approfondita</h1>
              <p className="text-sm text-muted-foreground">Carica fino a 15 foto e ricevi un report dettagliato per ognuna.</p>
            </div>

            <Card className="border-border/50 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Camera className="w-4 h-4 text-primary" />
                    Foto
                  </label>
                  <Badge variant="outline" className="text-xs">{images.length}/{MAX_IMAGES}</Badge>
                </div>

                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                    dragActive ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/40"
                  }`}
                  onDragEnter={e => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files) addImages(e.dataTransfer.files); }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={e => e.target.files && addImages(e.target.files)} />
                  <ImagePlus className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Trascina le foto qui o <span className="text-primary font-medium">carica</span>
                  </p>
                </div>

                {previews.length > 0 && (
                  <div className="grid grid-cols-5 sm:grid-cols-8 gap-2 mt-4">
                    {previews.map((src, i) => (
                      <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-border/50">
                        <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={e => { e.stopPropagation(); removeImage(i); }}
                          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-center text-white py-0.5">{i + 1}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Button variant="neon" size="lg" className="w-full" onClick={handleAnalyze} disabled={images.length === 0}>
              <Sparkles className="w-4 h-4 mr-2" />
              Avvia analisi immagini
            </Button>
          </>
        )}

        {isLoading && (
          <Card className="border-border/50">
            <AnalysisLoader isLoading={isLoading} />
          </Card>
        )}

        {report && !isLoading && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <Badge className="bg-green-500/10 text-green-500 border-green-500/30 mb-3">
                <Sparkles className="w-3 h-3 mr-1" />
                Analisi completata
              </Badge>
              <h2 className="text-2xl font-bold">Report fotografico</h2>
              <p className="text-sm text-muted-foreground">{report.length} foto analizzate</p>
            </div>

            <Accordion type="multiple" defaultValue={report.map((_, i) => `photo-${i}`)} className="space-y-3">
              {report.map((photo, i) => (
                <AccordionItem key={i} value={`photo-${i}`} className="border border-border/50 rounded-xl overflow-hidden bg-card/50">
                  <AccordionTrigger className="px-5 py-4 hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      {previews[i] && (
                        <img src={previews[i]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      )}
                      <div className="flex-1">
                        <span className="font-semibold text-sm">Foto {photo.photoIndex}</span>
                      </div>
                      {getScoreIcon(photo.score)}
                      <span className="text-sm font-bold">{photo.score}/10</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-5">
                    <div className="space-y-4">
                      {photo.problems.length > 0 && (
                        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                          <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Problemi</p>
                          <ul className="space-y-1.5">
                            {photo.problems.map((p, j) => (
                              <li key={j} className="flex items-start gap-2 text-sm text-foreground/80">
                                <span className="text-red-400 mt-0.5">•</span>
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {photo.solutions.length > 0 && (
                        <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                          <p className="text-xs font-semibold text-green-500 uppercase tracking-wider mb-2">Come risolvere</p>
                          <ul className="space-y-1.5">
                            {photo.solutions.map((s, j) => (
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

            <div className="flex flex-col gap-3 pt-4">
              <Button variant="neon" size="lg" className="w-full" onClick={() => { setReport(null); setImages([]); setPreviews([]); }}>
                Nuova analisi immagini
              </Button>
              <Button variant="glass" className="w-full" onClick={() => navigate("/engine")}>
                Torna a Engine
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EngineImageAnalysis;
