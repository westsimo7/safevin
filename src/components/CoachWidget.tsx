import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CoachWidget = () => {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const faqs = [
    { q: "Come funziona SafeVin Engine?", a: "Engine unisce Audit e Studio: analizzi il tuo annuncio, ricevi score e criticità, poi puoi generare una versione migliorata automaticamente." },
    { q: "Cos'è il SafeScore™?", a: "È un punteggio da 0 a 100 che misura la qualità complessiva del tuo annuncio su 10 categorie: foto, titolo, descrizione, prezzo, categoria, tag, condizioni, taglia/materiale, vita annuncio e psicologia acquirente." },
    { q: "Quante foto posso caricare?", a: "Puoi caricare fino a 15 immagini per analisi. Più foto carichi, più dettagliato sarà il report." },
    { q: "Come miglioro il mio annuncio?", a: "Dopo l'Audit, clicca 'Migliora il tuo annuncio': il sistema prende tutte le criticità trovate e genera automaticamente una versione ottimizzata pronta da incollare." },
  ];

  const [selectedFaq, setSelectedFaq] = useState<number | null>(null);

  return (
    <>
      {/* Bubble hint */}
      {!open && !dismissed && (
        <div className="fixed bottom-20 right-6 z-40 animate-fade-in">
          <div className="relative bg-card border border-border/50 rounded-2xl rounded-br-sm px-4 py-2.5 shadow-lg max-w-[220px]">
            <button onClick={() => setDismissed(true)} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-muted flex items-center justify-center">
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
            <p className="text-xs text-foreground/80">
              Sono il tuo coach. Posso aiutarti in qualcosa? 💡
            </p>
          </div>
        </div>
      )}

      {/* Float button */}
      <button
        onClick={() => { setOpen(!open); setDismissed(true); }}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="Coach"
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-80 max-h-[420px] bg-card border border-border/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          <div className="px-4 py-3 border-b border-border/50 bg-primary/5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">SafeVin Coach</p>
                <p className="text-[10px] text-muted-foreground">Sempre disponibile</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {selectedFaq !== null ? (
              <div className="space-y-3">
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
                  <p className="text-xs font-semibold text-primary mb-1">{faqs[selectedFaq].q}</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">{faqs[selectedFaq].a}</p>
                </div>
                <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setSelectedFaq(null)}>
                  ← Altre domande
                </Button>
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">Domande frequenti:</p>
                {faqs.map((faq, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedFaq(i)}
                    className="w-full text-left p-3 rounded-xl bg-muted/30 hover:bg-muted/50 border border-border/30 transition-colors"
                  >
                    <p className="text-sm text-foreground/80">{faq.q}</p>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CoachWidget;
