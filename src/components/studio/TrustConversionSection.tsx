import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Handshake, Target, Rocket } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TrustSectionData {
  buyerQuestions?: string[];
  actionChecklist?: string[];
  strategicScripts?: { label: string; script: string }[];
}

interface TrustConversionSectionProps {
  data: TrustSectionData;
}

const ScriptCopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded-md hover:bg-muted transition-colors active:scale-95 flex-shrink-0"
      aria-label="Copia"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
    </button>
  );
};

const TrustConversionSection = ({ data }: TrustConversionSectionProps) => {
  const [coachOpen, setCoachOpen] = useState(false);

  return (
    <>
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
        <CardContent className="p-5 space-y-5">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Handshake className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight">Fiducia & Conversione</h3>
                <p className="text-xs text-muted-foreground">Riduci i dubbi, aumenta i messaggi, chiudi più vendite.</p>
              </div>
            </div>
          </div>

          {/* Buyer Questions — reasoning block */}
          {data.buyerQuestions && data.buyerQuestions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                Cosa si chiede chi guarda questo annuncio
              </p>
              <ul className="space-y-2">
                {data.buyerQuestions.map((q, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-primary/60 text-sm mt-0.5">→</span>
                    <span className="text-sm text-foreground/90 leading-relaxed">{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Divider */}
          {data.buyerQuestions && data.buyerQuestions.length > 0 && data.actionChecklist && data.actionChecklist.length > 0 && (
            <div className="border-t border-border/30" />
          )}

          {/* Action points — no checkboxes, just strategic bullets */}
          {data.actionChecklist && data.actionChecklist.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Target className="w-4 h-4 text-primary" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Azioni che aumentano la fiducia ora
                </p>
              </div>
              <ul className="space-y-2">
                {data.actionChecklist.map((action, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-primary text-sm mt-0.5">•</span>
                    <span className="text-sm text-foreground/90 leading-relaxed">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Divider */}
          {data.strategicScripts && data.strategicScripts.length > 0 && (
            <div className="border-t border-border/30" />
          )}

          {/* Strategic Scripts */}
          {data.strategicScripts && data.strategicScripts.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                Risposte strategiche pronte
              </p>
              <div className="space-y-2.5">
                {data.strategicScripts.map((item, i) => (
                  <div key={i} className="rounded-lg border border-border/30 bg-muted/30 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <Badge variant="outline" className="text-[10px] font-medium">{item.label}</Badge>
                      <ScriptCopyButton text={item.script} />
                    </div>
                    <p className="text-sm text-foreground/85 leading-relaxed">"{item.script}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Divider before Coach CTA */}
          <div className="border-t border-border/30" />

          {/* Coach CTA — inside the same card */}
          <div
            className="flex items-center gap-3 cursor-pointer rounded-lg p-3 -mx-1 hover:bg-primary/5 transition-all duration-200"
            onClick={() => setCoachOpen(true)}
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Rocket className="w-4.5 h-4.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">Approfondisci con SafeVin Coach</p>
              <p className="text-xs text-muted-foreground leading-snug">
                Quello che stai leggendo è solo la superficie. Coach ti apre l'analisi completa: psicologia dell'acquirente, strategie di prezzo, gestione obiezioni — tutto ciò che separa un annuncio ignorato da una vendita chiusa.
              </p>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/30 text-[10px] flex-shrink-0">
              Presto
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Coach Modal */}
      <Dialog open={coachOpen} onOpenChange={setCoachOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" />
              SafeVin Coach
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed pt-2">
              Questa sezione è la punta dell'iceberg. SafeVin Coach ti guiderà in profondità: analisi psicologica dell'acquirente, gestione strategica dei messaggi, tecniche di pricing dinamico e ottimizzazione della conversione. Se vuoi davvero fare la differenza sul mercato, Coach è lo strumento che ti manca.
            </DialogDescription>
          </DialogHeader>
          <Button variant="glass" className="w-full mt-2" onClick={() => setCoachOpen(false)}>
            Ho capito
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TrustConversionSection;
