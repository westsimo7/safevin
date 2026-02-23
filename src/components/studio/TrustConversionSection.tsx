import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Brain, Target, MessageSquare, Rocket, Lock } from "lucide-react";
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
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [coachOpen, setCoachOpen] = useState(false);

  const toggleCheck = (index: number) => {
    setCheckedItems(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Lock className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight">Fiducia & Conversione</h3>
                <p className="text-xs text-muted-foreground">Riduci i dubbi, aumenta i messaggi, chiudi più vendite.</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground/80 leading-relaxed">
              Ogni acquisto online è una decisione basata sulla riduzione del rischio percepito. 
              Se non elimini i dubbi prima che nascano, la vendita non avviene. 
              Questa sezione è calibrata sul tuo annuncio.
            </p>
          </CardContent>
        </Card>

        {/* Buyer Questions */}
        {data.buyerQuestions && data.buyerQuestions.length > 0 && (
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-primary" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Cosa si chiede chi guarda questo annuncio?
                </p>
              </div>
              <ul className="space-y-2">
                {data.buyerQuestions.map((q, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-primary/60 text-sm mt-0.5">?</span>
                    <span className="text-sm text-foreground/90 italic">{q}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Action Checklist */}
        {data.actionChecklist && data.actionChecklist.length > 0 && (
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-primary" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Azioni che aumentano la fiducia ora
                </p>
              </div>
              <ul className="space-y-2.5">
                {data.actionChecklist.map((action, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Checkbox
                      checked={checkedItems[i] || false}
                      onCheckedChange={() => toggleCheck(i)}
                      className="mt-0.5"
                    />
                    <span className={`text-sm transition-all duration-200 ${checkedItems[i] ? "line-through text-muted-foreground/50" : "text-foreground/90"}`}>
                      {action}
                    </span>
                  </li>
                ))}
              </ul>
              {Object.values(checkedItems).filter(Boolean).length === (data.actionChecklist?.length || 0) && (data.actionChecklist?.length || 0) > 0 && (
                <div className="mt-3 pt-3 border-t border-border/30">
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/30 text-[10px]">
                    ✓ Tutte completate
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Strategic Scripts */}
        {data.strategicScripts && data.strategicScripts.length > 0 && (
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-primary" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Risposte strategiche pronte
                </p>
              </div>
              <div className="space-y-3">
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
            </CardContent>
          </Card>
        )}

        {/* Coach CTA */}
        <Card 
          className="border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 cursor-pointer hover:border-primary/40 transition-all duration-300"
          onClick={() => setCoachOpen(true)}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Rocket className="w-4.5 h-4.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">Approfondisci con SafeVin Coach</p>
              <p className="text-xs text-muted-foreground">Analizza il tuo annuncio e ti guida step-by-step fino alla vendita.</p>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/30 text-[10px] flex-shrink-0">
              Presto
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Coach Modal */}
      <Dialog open={coachOpen} onOpenChange={setCoachOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" />
              SafeVin Coach
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed pt-2">
              SafeVin Coach sarà presto disponibile. Ti guiderà dalla pubblicazione alla gestione dei messaggi con analisi psicologica avanzata dell'acquirente.
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
