import { useState } from "react";
import { Copy, Check, ArrowRight, RotateCcw, TrendingUp, Sparkles, CheckCircle2, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export interface StudioGeneratedOutput {
  title: string;
  description: string;
  details: {
    categoria: string;
    tipo_prodotto?: string;
    brand: string;
    taglia: string;
    condizione: string;
    colore: string;
    materiale: string;
    sesso?: string;
    misure?: string | null;
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
  hashtags?: string[];
}

interface StudioOutputProps {
  output: StudioGeneratedOutput;
  onNewAnalysis: () => void;
  onBack: () => void;
  onFinish?: () => void;
}

const DETAIL_ORDER: { key: string; label: string }[] = [
  { key: "brand", label: "Brand" },
  { key: "taglia", label: "Taglia" },
  { key: "colore", label: "Colore" },
  { key: "condizione", label: "Condizione" },
  { key: "materiale", label: "Materiale" },
  { key: "misure", label: "Misure" },
];

const StudioOutput = ({ output, onNewAnalysis, onBack, onFinish }: StudioOutputProps) => {
  const { toast } = useToast();
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [copiedTags, setCopiedTags] = useState(false);

  const handleCopyTitle = async () => {
    try {
      await navigator.clipboard.writeText(output.title);
      setCopiedTitle(true);
      toast({ title: "Titolo copiato!", description: "Incollalo nel campo titolo su Vinted" });
      setTimeout(() => setCopiedTitle(false), 2000);
    } catch {
      toast({ title: "Errore", description: "Non riesco a copiare", variant: "destructive" });
    }
  };

  const handleCopyDesc = async () => {
    try {
      await navigator.clipboard.writeText(output.description);
      setCopiedDesc(true);
      toast({ title: "Descrizione copiata!", description: "Incollala nel campo descrizione su Vinted" });
      setTimeout(() => setCopiedDesc(false), 2000);
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
          Copia titolo e descrizione separatamente e incollali su Vinted
        </p>
      </div>

      {/* TITLE BLOCK */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">Titolo SEO</p>
            <Button variant="ghost" size="sm" onClick={handleCopyTitle} className="text-xs gap-1.5">
              {copiedTitle ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedTitle ? "Copiato!" : "Copia titolo"}
            </Button>
          </div>
          <div className="p-4 rounded-xl bg-background/80 border border-border/30">
            <p className="font-bold text-base">{output.title}</p>
          </div>
        </CardContent>
      </Card>

      {/* DESCRIPTION BLOCK */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">Descrizione completa</p>
            <Button variant="ghost" size="sm" onClick={handleCopyDesc} className="text-xs gap-1.5">
              {copiedDesc ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedDesc ? "Copiato!" : "Copia descrizione"}
            </Button>
          </div>
          <div className="p-4 rounded-xl bg-background/80 border border-border/30">
            <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">{output.description}</p>
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

          {output.pricing.positioning && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Fascia di posizionamento</p>
              <Badge variant="outline" className="text-xs capitalize">{output.pricing.positioning}</Badge>
              {output.pricing.positioning_reason && (
                <p className="text-xs text-foreground/60 mt-1">{output.pricing.positioning_reason}</p>
              )}
            </div>
          )}

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

          <div className="p-3 rounded-xl bg-muted/20 border border-border/30">
            <p className="text-xs font-semibold text-foreground/80 mb-1">Perché questo prezzo:</p>
            <p className="text-xs text-foreground/70">{output.pricing.motivation}</p>
          </div>

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

      {/* DETAILS - ordered: categoria, tipo_prodotto, brand, taglia, condizione, colore, materiale, sesso, misure */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="px-4 py-3 border-b border-border/30">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Scheda prodotto</p>
          </div>
          <div className="divide-y divide-border/30">
            {DETAIL_ORDER.map(({ key, label }) => {
              const value = (output.details as Record<string, any>)[key];
              if (!value || value === "—" || value === "null") return null;
              return (
                <div key={key} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-sm font-medium text-right max-w-[60%]">{value}</span>
                </div>
              );
            })}
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

      {/* HASHTAGS */}
      {output.hashtags && output.hashtags.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-primary" />
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">Hashtag consigliati</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(output.hashtags!.join(" "));
                    setCopiedTags(true);
                    toast({ title: "Hashtag copiati!", description: "Incollali sotto la descrizione" });
                    setTimeout(() => setCopiedTags(false), 2000);
                  } catch {
                    toast({ title: "Errore", description: "Non riesco a copiare", variant: "destructive" });
                  }
                }}
                className="text-xs gap-1.5"
              >
                {copiedTags ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedTags ? "Copiati!" : "Copia"}
              </Button>
            </div>
            <div className="p-3 rounded-xl bg-background/80 border border-border/30">
              <p className="text-sm text-foreground/80 break-words">
                {output.hashtags.join(" ")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3">
        {onFinish && (
          <Button
            onClick={onFinish}
            className="w-full h-12 bg-green-600 hover:bg-green-500 text-white font-semibold shadow-lg shadow-green-600/30 border-0"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Fine — salva annuncio
          </Button>
        )}
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