import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, Eye, Target } from "lucide-react";

interface AnalysisCardProps {
  title: string;
  score: number;
  advice: string;
  impersonation?: string;
  scoreBreakdown?: string;
  conversionProbability?: number;
}

const AnalysisCard = ({
  title,
  score,
  advice,
  impersonation,
  scoreBreakdown,
  conversionProbability,
}: AnalysisCardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 7) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (score >= 4) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 7) return "Ottimale";
    if (score >= 4) return "Da ottimizzare";
    return "Critico";
  };

  const getConversionColor = (prob: number) => {
    if (prob >= 60) return "text-green-400";
    if (prob >= 30) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`${getScoreColor(score)} text-xs font-medium`}
            >
              {getScoreLabel(score)}
            </Badge>
            <span className="text-2xl font-bold text-foreground">
              {score}<span className="text-sm text-muted-foreground">/10</span>
            </span>
          </div>
        </div>
        
        {/* Conversion Probability */}
        {conversionProbability !== undefined && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/30">
            <Target className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Probabilità conversione:</span>
            <span className={`text-sm font-semibold ${getConversionColor(conversionProbability)}`}>
              {conversionProbability}%
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Impersonation - What the AI observed */}
        {impersonation && (
          <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">Osservazione</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {impersonation}
            </p>
          </div>
        )}

        {/* Score Breakdown - What lowers the score */}
        {scoreBreakdown && (
          <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs font-medium text-red-400">Fattori penalizzanti</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {scoreBreakdown}
            </p>
          </div>
        )}

        {/* Advice - Corrective action */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-sm text-foreground/90 leading-relaxed">
            {advice}
          </p>
        </div>

      </CardContent>
    </Card>
  );
};

export default AnalysisCard;
