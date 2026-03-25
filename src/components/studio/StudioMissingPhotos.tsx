import { useState } from "react";
import { Camera, Info, X, ArrowRight, CheckCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MissingPhoto } from "./StudioRecognition";

interface StudioMissingPhotosProps {
  missingPhotos: MissingPhoto[];
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

const StudioMissingPhotos = ({ missingPhotos, onContinue, onBack, onAskCoach }: StudioMissingPhotosProps) => {
  const [openTip, setOpenTip] = useState<number | null>(null);

  if (missingPhotos.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center mb-6">
          <Badge className="bg-green-500/10 text-green-500 border-green-500/30 mb-4">
            <CheckCircle className="w-3 h-3 mr-1" />
            Foto complete
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Ottime foto!</h2>
          <p className="text-sm text-muted-foreground">
            Hai caricato tutte le foto importanti per questo tipo di prodotto
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
        <h2 className="text-2xl font-bold tracking-tight mb-2">Foto suggerite</h2>
        <p className="text-sm text-muted-foreground">
          Queste foto potrebbero migliorare il tuo annuncio. Non sono obbligatorie.
        </p>
      </div>

      <div className="space-y-3">
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

              {/* Tips popup inline */}
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

      <Button variant="neon" size="lg" className="w-full" onClick={onContinue}>
        Continua senza aggiungere foto
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>

      <Button variant="ghost" className="w-full text-muted-foreground" onClick={onBack}>
        ← Torna ai dettagli
      </Button>
    </div>
  );
};

export default StudioMissingPhotos;
