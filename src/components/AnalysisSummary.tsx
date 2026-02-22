import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface AnalysisSummaryProps {
  summary: string;
}

const AnalysisSummary = ({ summary }: AnalysisSummaryProps) => {
  return (
    <Card className="border-primary/30 bg-gradient-to-br from-card to-primary/5">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          Report operativo completo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm prose-invert max-w-none">
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {summary}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisSummary;
