import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AnalysisCardProps {
  title: string;
  score: number;
  advice: string;
  hasUltimate?: boolean;
  ultimateContent?: string;
}

const AnalysisCard = ({
  title,
  score,
  advice,
  hasUltimate = false,
  ultimateContent,
}: AnalysisCardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 7) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (score >= 4) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 7) return "Buono";
    if (score >= 4) return "Da migliorare";
    return "Critico";
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
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {advice}
        </p>

        {/* Ultimate Section - Locked */}
        {hasUltimate && (
          <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-primary">🔒 Analisi Ultimate</span>
            </div>
            {ultimateContent ? (
              <p className="text-sm text-muted-foreground">{ultimateContent}</p>
            ) : (
              <p className="text-xs text-muted-foreground/70">
                Sblocca per vedere 3 versioni alternative professionali
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalysisCard;
