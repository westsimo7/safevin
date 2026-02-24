import { AlertTriangle } from "lucide-react";

const DisclaimerSection = () => {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="p-6 rounded-2xl border border-border/50 bg-card/50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Disclaimer</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>SafeViN è uno strumento indipendente: non collaboriamo con Vinted.</strong>
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Non garantiamo risultati certi: i risultati dipendono anche da prodotto, prezzo, domanda e qualità dell'offerta. SafeViN ti fornisce gli strumenti e l'analisi, ma il successo finale è influenzato da molti fattori di mercato.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DisclaimerSection;
