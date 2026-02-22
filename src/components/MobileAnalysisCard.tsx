import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Target, Eye, TrendingDown } from "lucide-react";

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
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
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

          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => setOpen(true)}
          >
            Dettaglio analisi
          </Button>
        </CardContent>
      </Card>

      {/* Full-screen overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/98 backdrop-blur-md animate-fade-in">
          {/* Fixed close button */}
          <div className="sticky top-0 z-10 flex justify-end p-4 bg-background/80 backdrop-blur-sm border-b border-border/30">
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
              aria-label="Chiudi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 pb-8">
            <div className="pt-4 space-y-4">
              {/* Header */}
              <div>
                <h3 className="text-lg font-bold mb-1">{title}</h3>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={`${getScoreColor(score)} text-xs`}>
                    {getScoreLabel(score)}
                  </Badge>
                  <span className="text-2xl font-bold">
                    {score}<span className="text-sm text-muted-foreground">/10</span>
                  </span>
                </div>
                {conversionProbability !== undefined && (
                  <div className="flex items-center gap-2 mt-2">
                    <Target className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Probabilità conversione:</span>
                    <span className={`text-sm font-semibold ${getConversionColor(conversionProbability)}`}>
                      {conversionProbability}%
                    </span>
                  </div>
                )}
              </div>

              {/* Impersonation */}
              {impersonation && (
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30 animate-fade-in" style={{ animationDelay: "0.05s" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-primary">Osservazione</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{impersonation}</p>
                </div>
              )}

              {/* Score breakdown */}
              {scoreBreakdown && (
                <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-xs font-medium text-red-400">Fattori penalizzanti</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{scoreBreakdown}</p>
                </div>
              )}

              {/* Advice */}
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 animate-fade-in" style={{ animationDelay: "0.15s" }}>
                <p className="text-sm text-foreground/90 leading-relaxed">{advice}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileAnalysisCard;
