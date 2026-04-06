import { Camera, ArrowRight, ArrowLeft, Sparkles, Crown, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const CRITERIA_LABELS: Record<string, { label: string; icon: string }> = {
  quality: { label: "Qualità", icon: "📷" },
  light: { label: "Luce", icon: "💡" },
  background_contrast: { label: "Contrasto sfondo", icon: "🎨" },
  completeness: { label: "Completezza", icon: "✅" },
};

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

  // Quality
  const qAvg = avgScores.quality ? avgScores.quality.reduce((a, b) => a + b, 0) / avgScores.quality.length : 0;
  results.push({
    key: "quality",
    label: "Qualità",
    icon: "📷",
    score: qAvg,
    ok: qAvg >= 3.5,
    verdict: qAvg >= 4
      ? "Le foto sono nitide e ben definite. Ottimo lavoro."
      : qAvg >= 3
        ? "Qualità accettabile ma alcune foto risultano poco definite. Prova a scattare con più luce naturale."
        : "Le foto risultano sgranate o sfocate. Riscatta con luce naturale e fotocamera stabile.",
  });

  // Light
  const lAvg = avgScores.light ? avgScores.light.reduce((a, b) => a + b, 0) / avgScores.light.length : 0;
  results.push({
    key: "light",
    label: "Luce",
    icon: "💡",
    score: lAvg,
    ok: lAvg >= 3.5,
    verdict: lAvg >= 4
      ? "Illuminazione uniforme e naturale. I dettagli sono ben visibili."
      : lAvg >= 3
        ? "Luce sufficiente ma alcune zone risultano in ombra. Usa luce naturale frontale."
        : "Illuminazione troppo scarsa o artificiale. Scatta vicino a una finestra con luce del giorno.",
  });

  // Background contrast
  const bgAvg = avgScores.background_contrast ? avgScores.background_contrast.reduce((a, b) => a + b, 0) / avgScores.background_contrast.length : 0;
  results.push({
    key: "background_contrast",
    label: "Contrasto sfondo",
    icon: "🎨",
    score: bgAvg,
    ok: bgAvg >= 3.5,
    verdict: bgAvg >= 4
      ? "Buon contrasto tra prodotto e sfondo. Il capo risalta bene."
      : bgAvg >= 3
        ? "Contrasto migliorabile. Evita sfondo e prodotto dello stesso tono (es. nero su blu scuro)."
        : "Poco contrasto: sfondo e prodotto si confondono. Usa un lenzuolo chiaro per capi scuri e viceversa.",
  });

  // Completeness
  const cAvg = avgScores.completeness ? avgScores.completeness.reduce((a, b) => a + b, 0) / avgScores.completeness.length : 0;
  const filteredMissing = missingPhotos.filter(p => p.type !== "worn" && p.type !== "has_worn");
  results.push({
    key: "completeness",
    label: "Completezza",
    icon: "✅",
    score: cAvg,
    ok: cAvg >= 3.5 && filteredMissing.length === 0,
    verdict: filteredMissing.length === 0
      ? "Set foto completo. Hai coperto tutti gli angoli importanti."
      : `Mancano: ${filteredMissing.map(m => m.name.toLowerCase()).join(", ")}. Aggiungile per un annuncio più completo.`,
  });

  return results;
}

const StudioMissingPhotos = ({ missingPhotos, photoQuality, previews, onContinue, onBack }: StudioMissingPhotosProps) => {
  const verdicts = buildCriteriaVerdicts(photoQuality || [], missingPhotos || []);
  const filteredMissing = (missingPhotos || []).filter(p => p.type !== "worn" && p.type !== "has_worn");
  const photosWithIssues = (photoQuality || []).filter(pq => pq.issues.length > 0);
  const hasIssues = filteredMissing.length > 0 || photosWithIssues.length > 0 || verdicts.some(v => !v.ok);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-4">
        <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
          <Camera className="w-3 h-3 mr-1" />
          Resoconto foto
        </Badge>
        <h2 className="text-2xl font-bold tracking-tight mb-2 font-heading text-primary">
          {hasIssues ? "Resoconto delle tue foto" : "Foto perfette!"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {hasIssues
            ? "Ecco cosa va bene e cosa potresti migliorare"
            : "Le tue immagini sono pronte per un annuncio efficace"}
        </p>
      </div>

      {/* Thumbnail strip */}
      {previews && previews.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {previews.slice(0, 8).map((src, i) => (
            <img key={i} src={src} alt="" className="w-12 h-12 rounded-lg object-cover border border-border/50 shrink-0" />
          ))}
          {previews.length > 8 && (
            <div className="w-12 h-12 rounded-lg bg-muted/30 border border-border/50 flex items-center justify-center text-xs text-muted-foreground shrink-0">
              +{previews.length - 8}
            </div>
          )}
        </div>
      )}

      {/* Criteria table */}
      <Card className="border-border/50 overflow-hidden">
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {verdicts.map((v) => (
              <div key={v.key} className="flex items-start gap-3 p-4">
                <div className="flex items-center gap-2 shrink-0 w-[130px]">
                  <span className="text-base">{v.icon}</span>
                  {v.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <span className="text-sm font-medium text-foreground">{v.label}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.verdict}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTAs */}
      <div className="space-y-3">
        {/* Continue */}
        <Button variant="neon" size="lg" className="w-full" onClick={onContinue}>
          <Sparkles className="w-4 h-4 mr-2" />
          Continua con queste foto
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>

        {/* Go back and re-upload */}
        <Button variant="glass" size="lg" className="w-full" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Torna indietro e ricarica le foto
        </Button>
        {hasIssues && (
          <p className="text-xs text-center text-muted-foreground -mt-1">
            Segui la guida fotografica nel carosello sopra per risultati migliori
          </p>
        )}

        {/* Premium CTA */}
        <Button
          variant="outline"
          size="lg"
          className="w-full border-amber-500/30 text-amber-600 hover:bg-amber-500/5 hover:border-amber-500/50"
          onClick={() => {
            window.dispatchEvent(new CustomEvent("open-coach", {
              detail: {
                message: "Vorrei usare SafeVin Creative Director per ottimizzare le mie foto professionalmente.",
              },
            }));
          }}
        >
          <Crown className="w-4 h-4 mr-2" />
          SafeVin Creative Director
          <Badge className="ml-2 bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px] px-1.5 py-0">
            Premium
          </Badge>
        </Button>
      </div>
    </div>
  );
};

export default StudioMissingPhotos;
