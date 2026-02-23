import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Target, Eye, TrendingDown, ChevronRight } from "lucide-react";

interface MobileAnalysisCardProps {
  title: string;
  score: number;
  advice: string;
  impersonation?: string;
  scoreBreakdown?: string;
  conversionProbability?: number;
}

const MobileAnalysisCard = ({
  title,
  score,
  advice,
  impersonation,
  scoreBreakdown,
  conversionProbability,
}: MobileAnalysisCardProps) => {
  const [open, setOpen] = useState(false);

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  const getScoreColor = (s: number) => {
    if (s >= 7) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (s >= 4) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 7) return "Ottimale";
    if (s >= 4) return "Da ottimizzare";
    return "Critico";
  };

  const getConversionColor = (p: number) => {
    if (p >= 60) return "text-green-400";
    if (p >= 30) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <>
      {/* Compact card */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm active:scale-[0.98] transition-transform" onClick={() => setOpen(true)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold truncate mr-2">{title}</span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className={`${getScoreColor(score)} text-xs`}>
                {getScoreLabel(score)}
              </Badge>
              <span className="text-lg font-bold">
                {score}<span className="text-xs text-muted-foreground">/10</span>
              </span>
            </div>
          </div>

          {conversionProbability !== undefined && (
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Probabilità conversione:</span>
              <span className={`text-sm font-semibold ${getConversionColor(conversionProbability)}`}>
                {conversionProbability}%
              </span>
            </div>
          )}

          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <span>Dettaglio analisi</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </CardContent>
      </Card>

      {/* Full-screen solid overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-50 flex flex-col bg-background"
          style={{ touchAction: "none" }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
            <h3 className="text-base font-bold truncate pr-4">{title}</h3>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors flex-shrink-0"
              aria-label="Chiudi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto overscroll-contain" style={{ touchAction: "pan-y" }}>
            <div className="px-5 py-6 space-y-5">
              {/* Score header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={`${getScoreColor(score)} text-xs`}>
                    {getScoreLabel(score)}
                  </Badge>
                  <span className="text-3xl font-black">
                    {score}<span className="text-base text-muted-foreground font-normal">/10</span>
                  </span>
                </div>
                {conversionProbability !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span className={`text-sm font-bold ${getConversionColor(conversionProbability)}`}>
                      {conversionProbability}%
                    </span>
                  </div>
                )}
              </div>

              {/* Impersonation */}
              {impersonation && (
                <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Eye className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wide">Osservazione</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{impersonation}</p>
                </div>
              )}

              {/* Score breakdown */}
              {scoreBreakdown && (
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-2.5">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">Fattori penalizzanti</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{scoreBreakdown}</p>
                </div>
              )}

              {/* Advice */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">Consigli</span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">{advice}</p>
              </div>
            </div>

            {/* Bottom safe area padding */}
            <div className="h-8" />
          </div>
        </div>
      )}
    </>
  );
};

export default MobileAnalysisCard;
