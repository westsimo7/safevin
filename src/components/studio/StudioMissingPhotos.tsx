import { useState } from "react";
import { Camera, Info, X, ArrowRight, CheckCircle, MessageCircle, AlertTriangle } from "lucide-react";
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

const PHOTO_ICONS: Record<string, string> = {
  front: "📸",
  back: "🔄",
  label_size: "📏",
  label_materials: "🏷️",
  defects: "🔍",
  logo_closeup: "🔎",
  worn: "👤",
  sole: "👟",
  inside: "🔲",
  lateral: "↔️",
  detail: "✨",
};

const ISSUE_TYPE_LABELS: Record<string, string> = {
  background: "Sfondo",
  light: "Luce",
  sharpness: "Nitidezza",
  framing: "Inquadratura",
};

const ISSUE_TYPE_ICONS: Record<string, string> = {
  background: "🖼️",
  light: "💡",
  sharpness: "🔍",
  framing: "📐",
};

const SEVERITY_COLORS: Record<string, string> = {
  minor: "text-yellow-500",
  moderate: "text-orange-500",
  major: "text-red-500",
};

const StudioMissingPhotos = ({ missingPhotos, photoQuality, previews, onContinue, onBack, onAskCoach }: StudioMissingPhotosProps) => {
  const [openTip, setOpenTip] = useState<number | null>(null);
  const [openQualityTip, setOpenQualityTip] = useState<string | null>(null);

  // Filter photos with actual issues
  const photosWithIssues = (photoQuality || []).filter(pq => pq.issues.length > 0);
  const hasQualityIssues = photosWithIssues.length > 0;
  const hasMissing = missingPhotos.length > 0;
  const hasNothing = !hasMissing && !hasQualityIssues;

  if (hasNothing) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center mb-6">
          <Badge className="bg-green-500/10 text-green-500 border-green-500/30 mb-4">
            <CheckCircle className="w-3 h-3 mr-1" />
            Foto complete
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Ottime foto!</h2>
          <p className="text-sm text-muted-foreground">
            Hai caricato tutte le foto importanti e la qualità è buona
          </p>
        </div>

        <Button variant="neon" size="lg" className="w-full" onClick={onContinue}>
          Continua
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <Button variant="ghost" className="w-full text-muted-foreground" onClick={onBack}>
          ← Torna ai dettagli
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
          <Camera className="w-3 h-3 mr-1" />
          Fase 2 di 2
        </Badge>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Migliora il tuo annuncio</h2>
        <p className="text-sm text-muted-foreground">
          Suggerimenti per aumentare le possibilità di vendita. Non sono obbligatori.
        </p>
      </div>

      {/* PHOTO QUALITY ISSUES */}
      {hasQualityIssues && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <p className="text-sm font-semibold">Foto migliorabili</p>
          </div>
          <p className="text-xs text-muted-foreground -mt-2 mb-2">
            Alcune foto non valorizzano al meglio il prodotto. Migliorarle può aumentare la fiducia degli acquirenti.
          </p>

          {photosWithIssues.map((pq) => (
            <Card key={`quality-${pq.photo_index}`} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Photo thumbnail */}
                  {previews && previews[pq.photo_index] ? (
                    <img
                      src={previews[pq.photo_index]}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover border border-border/50 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted/30 border border-border/50 flex items-center justify-center text-xs text-muted-foreground shrink-0">
                      #{pq.photo_index + 1}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">Foto {pq.photo_index + 1}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">{pq.summary}</p>
                  </div>
                  <button
                    onClick={() => setOpenQualityTip(openQualityTip === `q-${pq.photo_index}` ? null : `q-${pq.photo_index}`)}
                    className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors shrink-0"
                    aria-label="Info"
                  >
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Expanded quality details */}
                {openQualityTip === `q-${pq.photo_index}` && (
                  <div className="mt-3 p-3 rounded-xl bg-muted/20 border border-border/30 animate-fade-in">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-foreground/80">Come migliorare:</p>
                      <button onClick={() => setOpenQualityTip(null)} className="p-0.5">
                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                    <ul className="space-y-2.5 mb-3">
                      {pq.issues.map((issue, j) => (
                        <li key={j} className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{ISSUE_TYPE_ICONS[issue.type] || "⚠️"}</span>
                            <span className={`text-xs font-semibold ${SEVERITY_COLORS[issue.severity] || "text-muted-foreground"}`}>
                              {ISSUE_TYPE_LABELS[issue.type] || issue.type}
                            </span>
                          </div>
                          <p className="text-xs text-foreground/70 ml-5">{issue.problem}</p>
                          <p className="text-xs text-primary/80 ml-5">→ {issue.suggestion}</p>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => {
                        setOpenQualityTip(null);
                        onAskCoach(`migliorare la foto ${pq.photo_index + 1} (problemi: ${pq.issues.map(i => ISSUE_TYPE_LABELS[i.type] || i.type).join(", ")})`);
                      }}
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline cursor-pointer"
                    >
                      <MessageCircle className="w-3 h-3" />
                      Hai bisogno di più aiuto?
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* MISSING PHOTOS */}
      {hasMissing && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Camera className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold">Foto suggerite</p>
          </div>
          <p className="text-xs text-muted-foreground -mt-2 mb-2">
            Queste foto potrebbero migliorare il tuo annuncio.
          </p>

          {missingPhotos.map((photo, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{PHOTO_ICONS[photo.type] || "📷"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{photo.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{photo.reason}</p>
                  </div>
                  <button
                    onClick={() => setOpenTip(openTip === i ? null : i)}
                    className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors shrink-0"
                    aria-label="Info"
                  >
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {openTip === i && (
                  <div className="mt-3 p-3 rounded-xl bg-muted/20 border border-border/30 animate-fade-in">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-foreground/80">Come scattare questa foto:</p>
                      <button onClick={() => setOpenTip(null)} className="p-0.5">
                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                    <ul className="space-y-1.5 mb-3">
                      {photo.tips.map((tip, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs text-foreground/70">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => {
                        setOpenTip(null);
                        onAskCoach(photo.name);
                      }}
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline cursor-pointer"
                    >
                      <MessageCircle className="w-3 h-3" />
                      Hai bisogno di più aiuto?
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Button variant="neon" size="lg" className="w-full" onClick={onContinue}>
        {hasMissing ? "Continua senza aggiungere foto" : "Continua"}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>

      <Button variant="ghost" className="w-full text-muted-foreground" onClick={onBack}>
        ← Torna ai dettagli
      </Button>
    </div>
  );
};

export default StudioMissingPhotos;
