import { useState } from "react";
import { Copy, Check, ArrowRight, RotateCcw, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export interface StudioGeneratedOutput {
  title: string;
  description: string;
  details: {
    categoria: string;
    brand: string;
    colore: string;
    taglia: string;
    condizione: string;
    materiale: string;
  };
  pricing: {
    min_accepted: number;
    suggested_low: number;
    suggested_high: number;
    positioning?: string;
    positioning_reason?: string;
    motivation: string;
    negotiation: string[];
  };
  tips: string[];
}

interface StudioOutputProps {
  output: StudioGeneratedOutput;
  onNewAnalysis: () => void;
  onBack: () => void;
}

const StudioOutput = ({ output, onNewAnalysis, onBack }: StudioOutputProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyText = `${output.title}\n\n${output.description}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      toast({ title: "Copiato!", description: "Testo pronto da incollare su Vinted" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Errore", description: "Non riesco a copiare", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <Badge className="bg-green-500/10 text-green-500 border-green-500/30 mb-4">
          <Sparkles className="w-3 h-3 mr-1" />
          Annuncio pronto
        </Badge>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Il tuo annuncio è pronto! 🎉</h2>
        <p className="text-sm text-muted-foreground">
          Copia e incolla direttamente su Vinted
        </p>
      </div>

      {/* COPY-READY BOX */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">Pronto da copiare</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="text-xs gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copiato!" : "Copia tutto"}
            </Button>
          </div>
          <div className="space-y-3 p-4 rounded-xl bg-background/80 border border-border/30">
            <p className="font-bold text-base">{output.title}</p>
            <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">{output.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* DETAILS */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="px-4 py-3 border-b border-border/30">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dettagli strutturati</p>
          </div>
          <div className="divide-y divide-border/30">
            {Object.entries(output.details).map(([key, value]) => {
              if (!value || value === "—") return null;
              const labels: Record<string, string> = {
                categoria: "Categoria",
                brand: "Brand",
                colore: "Colore",
                taglia: "Taglia",
                condizione: "Condizione",
                materiale: "Materiale",
              };
              return (
                <div key={key} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-muted-foreground">{labels[key] || key}</span>
                  <span className="text-sm font-medium">{value}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* PRICING */}
      <Card className="border-border/50">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Strategia prezzo</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Minimo</p>
              <p className="text-lg font-bold">{output.pricing.min_accepted}€</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="text-center flex-1">
              <p className="text-xs text-muted-foreground">Prezzo consigliato</p>
              <p className="text-lg font-bold text-primary">
                {output.pricing.suggested_low}–{output.pricing.suggested_high}€
              </p>
            </div>
          </div>

          <p className="text-xs text-foreground/70">{output.pricing.motivation}</p>

          <div className="space-y-2 p-3 rounded-xl bg-muted/20 border border-border/30">
            <p className="text-xs font-semibold text-foreground/80">Strategia trattativa:</p>
            {output.pricing.negotiation.map((step, i) => (
              <p key={i} className="text-xs text-foreground/70 flex items-start gap-2">
                <span className="text-primary mt-0.5">→</span>
                <span>{step}</span>
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* TIPS */}
      <Card className="border-border/50">
        <CardContent className="p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Micro strategie di vendita
          </p>
          {output.tips.map((tip, i) => (
            <p key={i} className="text-xs text-foreground/70 flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>{tip}</span>
            </p>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button variant="neon" size="lg" className="w-full" onClick={handleCopy}>
          {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? "Copiato!" : "Copia annuncio"}
        </Button>
        <Button variant="glass" className="w-full" onClick={onNewAnalysis}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Nuova analisi
        </Button>
        <Button variant="ghost" className="w-full text-muted-foreground" onClick={onBack}>
          ← Torna indietro
        </Button>
      </div>
    </div>
  );
};

export default StudioOutput;
