import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, Lock, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AdvancedCheck {
  label: string;
  status: "ok" | "warning" | "error";
  detail: string;
}

interface AnalysisCardProps {
  title: string;
  score: number;
  advice: string;
  advancedChecks?: AdvancedCheck[];
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

const getStatusIcon = (status: "ok" | "warning" | "error") => {
  switch (status) {
    case "ok":
      return <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />;
    case "warning":
      return <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />;
    case "error":
      return <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />;
  }
};

const getStatusBg = (status: "ok" | "warning" | "error") => {
  switch (status) {
    case "ok":
      return "bg-green-500/5 border-green-500/20";
    case "warning":
      return "bg-yellow-500/5 border-yellow-500/20";
    case "error":
      return "bg-red-500/5 border-red-500/20";
  }
};

const AnalysisCard = ({ title, score, advice, advancedChecks, ultimateContent, hasUltimate = false }: AnalysisCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

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
        
        {/* Advanced Checks Section */}
        {advancedChecks && advancedChecks.length > 0 && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
              <span className="text-sm font-medium text-foreground">Controlli Avanzati</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {advancedChecks.filter(c => c.status === "ok").length}/{advancedChecks.length} ok
                </span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              {advancedChecks.map((check, index) => (
                <div 
                  key={index} 
                  className={`flex items-start gap-3 p-3 rounded-lg border ${getStatusBg(check.status)}`}
                >
                  {getStatusIcon(check.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{check.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{check.detail}</p>
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
        
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
