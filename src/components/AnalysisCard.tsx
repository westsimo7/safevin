import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Crown } from "lucide-react";

interface AnalysisCardProps {
  title: string;
  score: number;
  advice: string;
  hasUltimate?: boolean;
  ultimateContent?: string;
  isUltimateUnlocked?: boolean;
  onUpgradeClick?: () => void;
}

const AnalysisCard = ({
  title,
  score,
  advice,
  hasUltimate = true,
  ultimateContent,
  isUltimateUnlocked = false,
  onUpgradeClick,
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

        {/* Ultimate Section */}
        {hasUltimate && (
          <div className="mt-4 p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-amber-400">Analisi Ultimate</span>
            </div>
            
            {isUltimateUnlocked && ultimateContent ? (
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                {ultimateContent}
              </p>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <p className="text-sm text-muted-foreground/50 blur-[2px] select-none leading-relaxed">
                    Versione migliorata del titolo pronta da copiare, strategie prezzo concrete, 
                    template risposte veloci e molto altro contenuto esclusivo...
                  </p>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-amber-400/60" />
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                  onClick={onUpgradeClick}
                >
                  <Crown className="w-3 h-3 mr-2" />
                  Sblocca con Ultimate
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalysisCard;
