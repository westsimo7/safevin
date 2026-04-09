import { useState } from "react";
import { Camera, ArrowRight, Sparkles, Crown, CheckCircle2, AlertTriangle, Wrench } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { MissingPhoto } from "./StudioRecognition";

export interface PhotoQualityIssue {
  type: string;
  severity: string;
  problem: string;
  suggestion: string;
  impact: string;
}

export interface PhotoQuality {
  photo_index: number;
  summary: string;
  scores?: {
    quality: number;
    light: number;
    background_contrast: number;
    completeness: number;
  };
  issues: PhotoQualityIssue[];
}

interface StudioMissingPhotosProps {
  missingPhotos: MissingPhoto[];
  photoQuality?: PhotoQuality[];
  previews?: string[];
  onContinue: () => void;
  onBack: () => void;
  onAskCoach: (photoName: string) => void;
}

/** Build per-criteria verdict (max ~45 words each) */
function buildCriteriaVerdicts(
  photoQuality: PhotoQuality[],
  missingPhotos: MissingPhoto[]
): { key: string; label: string; icon: string; score: number; verdict: string; ok: boolean }[] {
  const avgScores: Record<string, number[]> = {};
  for (const pq of photoQuality) {
    if (pq.scores) {
      for (const [key, val] of Object.entries(pq.scores)) {
        if (!avgScores[key]) avgScores[key] = [];
        avgScores[key].push(val);
      }
    }
  }

  const results: { key: string; label: string; icon: string; score: number; verdict: string; ok: boolean }[] = [];

  const qAvg = avgScores.quality ? avgScores.quality.reduce((a, b) => a + b, 0) / avgScores.quality.length : 0;
  results.push({
    key: "quality", label: "Qualità", icon: "📷", score: qAvg, ok: qAvg >= 3.5,
    verdict: qAvg >= 4
      ? "Le foto sono nitide e ben definite. Ottimo lavoro."
      : qAvg >= 3
        ? "Qualità accettabile ma alcune foto risultano poco definite. Prova a scattare con più luce naturale."
        : "Le foto risultano sgranate o sfocate. Riscatta con luce naturale e fotocamera stabile.",
  });

  const lAvg = avgScores.light ? avgScores.light.reduce((a, b) => a + b, 0) / avgScores.light.length : 0;
  results.push({
    key: "light", label: "Luce", icon: "💡", score: lAvg, ok: lAvg >= 3.5,
    verdict: lAvg >= 4
      ? "L'indumento si vede bene, nessun dettaglio nascosto. Ottimo."
      : lAvg >= 3
        ? "Alcuni dettagli sono in ombra o in controluce. Scatta con luce frontale così l'indumento si vede chiaramente."
        : "L'indumento è troppo scuro o in controluce, i dettagli non si vedono. Mettiti davanti a una finestra e scatta con luce naturale frontale.",
  });

  const bgAvg = avgScores.background_contrast ? avgScores.background_contrast.reduce((a, b) => a + b, 0) / avgScores.background_contrast.length : 0;
  results.push({
    key: "background_contrast", label: "Contrasto", icon: "🎨", score: bgAvg, ok: bgAvg >= 3.5,
    verdict: bgAvg >= 4
      ? "Contrasto efficace: il capo si stacca nettamente dallo sfondo, risulta leggibile e protagonista dell'immagine."
      : bgAvg >= 3
        ? "Contrasto parzialmente efficace: il capo si distingue ma non risalta al massimo. Prova uno sfondo con luminosità più distante dal colore del capo."
        : "Contrasto inefficace: il capo si confonde con lo sfondo. Usa un telo di colore opposto (chiaro per capi scuri, scuro per capi chiari) per farlo risaltare.",
  });

  const cAvg = avgScores.completeness ? avgScores.completeness.reduce((a, b) => a + b, 0) / avgScores.completeness.length : 0;
  const filteredMissing = missingPhotos.filter(p => p.type !== "worn" && p.type !== "has_worn");
  results.push({
    key: "completeness", label: "Completezza", icon: "✅", score: cAvg, ok: cAvg >= 3.5 && filteredMissing.length === 0,
    verdict: filteredMissing.length === 0
      ? "Set foto completo. Hai coperto tutti gli angoli importanti."
      : `Mancano: ${filteredMissing.map(m => m.name.toLowerCase()).join(", ")}. Aggiungile per un annuncio più completo.`,
  });

  return results;
}

const StudioMissingPhotos = ({ missingPhotos, photoQuality, previews, onContinue, onBack }: StudioMissingPhotosProps) => {
  const [improveOpen, setImproveOpen] = useState(false);
  const verdicts = buildCriteriaVerdicts(photoQuality || [], missingPhotos || []);
  const filteredMissing = (missingPhotos || []).filter(p => p.type !== "worn" && p.type !== "has_worn");
  const photosWithIssues = (photoQuality || []).filter(pq => pq.issues.length > 0);
  const hasIssues = filteredMissing.length > 0 || photosWithIssues.length > 0 || verdicts.some(v => !v.ok);

  return (
    <div className="flex flex-col h-full animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="shrink-0">
        <PageTitle
          title={hasIssues ? "Resoconto delle tue foto" : "Foto perfette!"}
          subtitle={hasIssues
            ? "Ecco cosa va bene e cosa potresti migliorare"
            : "Le tue immagini sono pronte per un annuncio efficace"}
          badge={<Badge className="bg-primary/10 text-primary border-primary/20">Fase 2 di 3</Badge>}
          className="text-center"
        />
      </div>

      {/* Criteria cards - scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide space-y-2 py-2">
        {verdicts.map((v) => (
          <Card key={v.key} className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{v.icon}</span>
                {v.ok ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0" />
                )}
                <h3 className="text-sm font-semibold text-foreground font-heading">{v.label}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pl-[30px]">{v.verdict}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTAs */}
      <div className="shrink-0 space-y-2 pt-2">
        <Button variant="neon" size="lg" className="w-full" onClick={onContinue}>
          <Sparkles className="w-4 h-4 mr-2" />
          Continua con queste foto
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>

        <button
          className="w-full rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15 hover:border-amber-500/50 transition-colors p-2.5 flex items-center justify-center gap-2 text-amber-500 font-semibold text-sm"
          onClick={() => setImproveOpen(true)}
        >
          <Wrench className="w-4 h-4" />
          Migliora le foto
        </button>

        <button
          className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5"
          onClick={onBack}
        >
          ← Torna ai dettagli
        </button>
      </div>

      {/* Improve dialog */}
      <Dialog open={improveOpen} onOpenChange={setImproveOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">Migliora le tue foto</DialogTitle>
            <DialogDescription>
              Scegli come vuoi migliorare le tue immagini
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2 overflow-hidden">
            <button
              className="w-full text-left rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors p-4"
              onClick={() => {
                setImproveOpen(false);
                const reportSummary = verdicts.map(v => `${v.icon} ${v.label}: ${v.ok ? "OK" : "Da migliorare"} — ${v.verdict}`).join("\n");
                window.dispatchEvent(new CustomEvent("open-coach", {
                  detail: {
                    message: `[STUDIO PHOTO REVIEW]\n\nResoconto qualità foto:\n${reportSummary}\n\nHo allegato le foto del mio annuncio. Vuoi procedere con i feedback migliorativi?`,
                    images: previews || [],
                  },
                }));
              }}
            >
              <span className="font-semibold text-foreground text-sm block">Approfondisci con il Coach</span>
              <span className="text-xs text-muted-foreground mt-1 block">
                Ricevi consigli pratici per risolvere o completare le info mancanti
              </span>
            </button>

            <button
              className="w-full text-left rounded-lg border border-amber-500/30 hover:bg-amber-500/5 hover:border-amber-500/50 transition-colors p-4"
              onClick={() => {
                setImproveOpen(false);
                window.dispatchEvent(new CustomEvent("open-coach", {
                  detail: {
                    message: "Vorrei usare SafeVin Creative Director per ottimizzare le mie foto professionalmente.",
                  },
                }));
              }}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-semibold text-amber-600 text-sm">SafeVin Creative Director</span>
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px] px-1.5 py-0">
                  Premium
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">
                Affida le campagne dei tuoi indumenti al team SafeVin per una resa di qualità massima su misura
              </span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudioMissingPhotos;
