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

const CRITERIA_LABELS: Record<string, string> = {
  quality: "Qualità",
  light: "Luce",
  background_contrast: "Contrasto sfondo",
  completeness: "Completezza",
};

/** Build a natural-language paragraph summarizing all photo quality */
function buildPhotoReport(photoQuality: PhotoQuality[], previews: string[], missingPhotos: MissingPhoto[]): string {
  const totalPhotos = previews.length;
  const photosWithIssues = photoQuality.filter(pq => pq.issues.length > 0);
  const filteredMissing = missingPhotos.filter(p => p.type !== "worn" && p.type !== "has_worn");

  const lines: string[] = [];

  // Overall intro
  if (totalPhotos > 0) {
    lines.push(`Hai caricato ${totalPhotos} foto.`);
  }

  // Quality summary per criteria
  if (photoQuality.length > 0) {
    const avgScores: Record<string, number[]> = {};
    for (const pq of photoQuality) {
      if (pq.scores) {
        for (const [key, val] of Object.entries(pq.scores)) {
          if (!avgScores[key]) avgScores[key] = [];
          avgScores[key].push(val);
        }
      }
    }

    const good: string[] = [];
    const improve: string[] = [];

    for (const [key, vals] of Object.entries(avgScores)) {
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      const label = CRITERIA_LABELS[key] || key;
      if (avg >= 4) {
        good.push(label.toLowerCase());
      } else if (avg < 3) {
        improve.push(label.toLowerCase());
      }
    }

    if (good.length > 0) {
      lines.push(`La ${good.join(", la ")} delle tue foto ${good.length === 1 ? "è buona" : "sono buone"} — ottimo lavoro.`);
    }

    if (improve.length > 0) {
      lines.push(`Potresti migliorare ${improve.join(" e ")}: questo aiuterebbe il tuo annuncio a risultare più professionale e affidabile.`);
    }
  }

  // Specific issues
  if (photosWithIssues.length > 0) {
    const issueTexts: string[] = [];
    for (const pq of photosWithIssues) {
      for (const issue of pq.issues) {
        issueTexts.push(`nella foto ${pq.photo_index + 1}, ${issue.problem.toLowerCase()}${issue.suggestion ? ` — ${issue.suggestion.toLowerCase()}` : ""}`);
      }
    }
    if (issueTexts.length > 0) {
      lines.push(`In particolare: ${issueTexts.slice(0, 4).join("; ")}.`);
    }
  }

  // Missing photos
  if (filteredMissing.length > 0) {
    const missingNames = filteredMissing.map(m => m.name.toLowerCase());
    lines.push(`Per un annuncio più completo, consigliamo di aggiungere anche: ${missingNames.join(", ")}.`);
  }

  // No issues at all
  if (photosWithIssues.length === 0 && filteredMissing.length === 0) {
    lines.push("Le tue foto sono complete e di buona qualità — sei pronto per continuare!");
  }

  return lines.join(" ");
}

const StudioMissingPhotos = ({ missingPhotos, photoQuality, previews, onContinue, onBack }: StudioMissingPhotosProps) => {
  const report = buildPhotoReport(photoQuality || [], previews || [], missingPhotos || []);
  const filteredMissing = (missingPhotos || []).filter(p => p.type !== "worn" && p.type !== "has_worn");
  const photosWithIssues = (photoQuality || []).filter(pq => pq.issues.length > 0);
  const hasIssues = filteredMissing.length > 0 || photosWithIssues.length > 0;

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

      {/* Written report */}
      <Card className="border-border/50">
        <CardContent className="p-5">
          <p className="text-sm leading-relaxed text-foreground/80">
            {report}
          </p>
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
