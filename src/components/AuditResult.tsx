import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Eye, FileText, DollarSign, Shield, Camera } from "lucide-react";

export interface AuditResultData {
  safeScore: number;
  label: string;
  categories: {
    attenzione: { score: number; phrase: string };
    chiarezza: { score: number; phrase: string };
    valore: { score: number; phrase: string };
    fiducia: { score: number; phrase: string };
    immagini: { score: number; phrase: string };
  };
}

const categoryMeta = [
  { key: "attenzione" as const, label: "Attenzione", icon: Eye, weight: "25%" },
  { key: "chiarezza" as const, label: "Chiarezza", icon: FileText, weight: "25%" },
  { key: "valore" as const, label: "Valore", icon: DollarSign, weight: "20%" },
  { key: "fiducia" as const, label: "Fiducia", icon: Shield, weight: "15%" },
  { key: "immagini" as const, label: "Immagini", icon: Camera, weight: "15%" },
];

const getScoreColor = (score: number) => {
  if (score >= 85) return "text-green-400";
  if (score >= 65) return "text-yellow-400";
  if (score >= 55) return "text-orange-400";
  return "text-red-400";
};

const getProgressColor = (score: number) => {
  if (score >= 85) return "bg-green-400";
  if (score >= 65) return "bg-yellow-400";
  if (score >= 55) return "bg-orange-400";
  return "bg-red-400";
};

const AuditResult = ({ result }: { result: AuditResultData }) => {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* SAFE SCORE */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-primary/20 bg-card/80 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-6 text-center space-y-3">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Safe Score
            </p>
            <div className="flex items-baseline justify-center gap-1">
              <span className={`text-5xl font-bold tabular-nums ${getScoreColor(result.safeScore)}`}>
                {result.safeScore}%
              </span>
              <span className="text-lg text-muted-foreground">/100%</span>
            </div>
            <Badge
              variant="outline"
              className={`text-xs ${getScoreColor(result.safeScore)} border-current`}
            >
              {result.label}
            </Badge>
            <p className="text-xs text-muted-foreground">probabilità di vendita stimata</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Categories */}
      <div className="space-y-3">
        {categoryMeta.map((cat, i) => {
          const data = result.categories[cat.key];
          const Icon = cat.icon;
          return (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.1 + i * 0.08 }}
            >
              <Card className="border-border/50 bg-card/60">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold">{cat.label}</span>
                    </div>
                    <span className={`text-sm font-bold tabular-nums ${getScoreColor(data.score)}`}>
                      {data.score}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${getProgressColor(data.score)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${data.score}%` }}
                      transition={{ duration: 0.6, delay: 0.2 + i * 0.08 }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">{data.phrase}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AuditResult;
