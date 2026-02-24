import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Eye, TrendingDown, Info, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

interface AnalysisSection {
  title: string;
  score: number;
  advice: string;
  impersonation?: string;
  scoreBreakdown?: string;
  conversionProbability?: number;
}

const EngineAnalysisCard = ({ section }: { section: AnalysisSection }) => {
  const [detailOpen, setDetailOpen] = useState(false);

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
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">{section.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`${getScoreColor(section.score)} text-xs font-medium`}>
                {getScoreLabel(section.score)}
              </Badge>
              <span className="text-2xl font-bold">{section.score}<span className="text-sm text-muted-foreground">/10</span></span>
            </div>
          </div>

          {section.conversionProbability !== undefined && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/30">
              <Target className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Conversione:</span>
              <span className={`text-sm font-semibold ${getConversionColor(section.conversionProbability)}`}>
                {section.conversionProbability}%
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Only Problem + Resolution visible by default */}
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-foreground/90 leading-relaxed">{section.advice}</p>
          </div>

          {/* Approfondisci button */}
          {(section.impersonation || section.scoreBreakdown) && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground hover:text-primary"
              onClick={() => setDetailOpen(true)}
            >
              <Info className="w-3.5 h-3.5 mr-1" />
              Approfondisci
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent side="bottom" className="max-h-[80vh] rounded-t-2xl">
          <SheetHeader className="pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg">{section.title}</SheetTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`${getScoreColor(section.score)} text-xs`}>
                  {section.score}/10
                </Badge>
              </div>
            </div>
          </SheetHeader>

          <div className="space-y-4 overflow-y-auto pr-2">
            {section.impersonation && (
              <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                <div className="flex items-center gap-2 mb-2.5">
                  <Eye className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">Osservazione</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{section.impersonation}</p>
              </div>
            )}

            {section.scoreBreakdown && (
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                <div className="flex items-center gap-2 mb-2.5">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">Fattori penalizzanti</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{section.scoreBreakdown}</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default EngineAnalysisCard;
