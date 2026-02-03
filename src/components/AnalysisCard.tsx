import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, Lock } from "lucide-react";

interface AnalysisCardProps {
  title: string;
  score: number;
  advice: string;
  ultimateContent?: string;
  hasUltimate?: boolean;
}

const getScoreColor = (score: number) => {
  if (score >= 7) return "green";
  if (score >= 4) return "yellow";
  return "red";
};

const getScoreIcon = (score: number) => {
  if (score >= 7) return <CheckCircle className="w-5 h-5 text-green-500" />;
  if (score >= 4) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
  return <XCircle className="w-5 h-5 text-red-500" />;
};

const getScoreBadgeClass = (score: number) => {
  if (score >= 7) return "bg-green-500/10 text-green-500 border-green-500/30";
  if (score >= 4) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
  return "bg-red-500/10 text-red-500 border-red-500/30";
};

const AnalysisCard = ({ title, score, advice, ultimateContent, hasUltimate = false }: AnalysisCardProps) => {
  const color = getScoreColor(score);

  return (
    <Card className="border-border/50 hover:border-border transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getScoreIcon(score)}
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
          </div>
          <Badge className={getScoreBadgeClass(score)}>
            {score}/10
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">{advice}</p>
        
        {/* Ultimate Section */}
        {hasUltimate && ultimateContent ? (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-primary">Analisi Ultimate</span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{ultimateContent}</p>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">Analisi Ultimate</span>
            </div>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Sblocca consigli avanzati e versioni ottimizzate con il piano Ultimate.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalysisCard;
