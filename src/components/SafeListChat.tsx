import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, AlertTriangle, CheckCircle, Loader2, Send, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import PaisleyPattern from "./PaisleyPattern";

interface ListingData {
  piattaforma: string;
  titolo: string;
  descrizione: string;
  prezzo: string;
  categoria: string;
  condizioni: string;
  annunciSimili: string;
  frequenzaPubblicazione: string;
}

const initialListing: ListingData = {
  piattaforma: "Vinted",
  titolo: "",
  descrizione: "",
  prezzo: "",
  categoria: "",
  condizioni: "Nuovo con etichetta",
  annunciSimili: "5",
  frequenzaPubblicazione: "3",
};

const SafeListChat = () => {
  const [listing, setListing] = useState<ListingData>(initialListing);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof ListingData, value: string) => {
    setListing(prev => ({ ...prev, [field]: value }));
  };

  const getRiskLevel = (text: string): "low" | "medium" | "high" | null => {
    const match = text.match(/RISK SCORE:\s*(\d+)/i);
    if (match) {
      const score = parseInt(match[1]);
      if (score <= 30) return "low";
      if (score <= 60) return "medium";
      return "high";
    }
    return null;
  };

  const handleAnalyze = async () => {
    if (!listing.titolo.trim() || !listing.descrizione.trim()) {
      toast({
        title: "Campi mancanti",
        description: "Inserisci almeno titolo e descrizione dell'annuncio.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke("safelist-analyze", {
        body: { listing },
      });

      if (error) {
        console.error("Function error:", error);
        toast({
          title: "Errore analisi",
          description: error.message || "Impossibile analizzare l'annuncio.",
          variant: "destructive",
        });
        return;
      }

      if (data?.analysis) {
        setAnalysis(data.analysis);
      } else if (data?.error) {
        toast({
          title: "Errore",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        title: "Errore",
        description: "Si è verificato un errore imprevisto.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setListing(initialListing);
    setAnalysis(null);
  };

  const riskLevel = analysis ? getRiskLevel(analysis) : null;

  return (
    <section className="relative py-32 bg-background overflow-hidden" id="safelist">
      {/* Background */}
      <div className="absolute inset-0 text-neon-red/5">
        <PaisleyPattern opacity={0.04} />
      </div>
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-neon-red/10 rounded-full blur-[200px]" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan/10 rounded-full blur-[150px]" />

      <div className="relative z-10 container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neon-red/30 bg-neon-red/5 backdrop-blur-sm mb-6">
            <Shield className="w-4 h-4 text-neon-red" />
            <span className="text-sm font-medium text-foreground/80">Prevenzione Ban AI</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="text-foreground">SAFE</span>
            <span className="text-neon-red text-glow-red">LIST</span>
          </h2>
          <p className="text-foreground/60 max-w-xl mx-auto">
            Analizza il tuo annuncio prima di pubblicarlo. Riduci il rischio di ban.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Input Form */}
          <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-xl border border-border/50">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Send className="w-5 h-5 text-neon-red" />
              Dati Annuncio
            </h3>

            <div className="space-y-4">
              {/* Platform */}
              <div>
                <label className="text-sm text-foreground/60 mb-2 block">Piattaforma</label>
                <Select value={listing.piattaforma} onValueChange={(v) => handleInputChange("piattaforma", v)}>
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vinted">Vinted</SelectItem>
                    <SelectItem value="Depop">Depop</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div>
                <label className="text-sm text-foreground/60 mb-2 block">Titolo annuncio *</label>
                <Input
                  value={listing.titolo}
                  onChange={(e) => handleInputChange("titolo", e.target.value)}
                  placeholder="Es: Nike Air Max 90 nuove"
                  className="bg-background/50 border-border/50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm text-foreground/60 mb-2 block">Descrizione annuncio *</label>
                <Textarea
                  value={listing.descrizione}
                  onChange={(e) => handleInputChange("descrizione", e.target.value)}
                  placeholder="Descrivi il tuo articolo..."
                  className="bg-background/50 border-border/50 min-h-[120px]"
                />
              </div>

              {/* Price & Category Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-foreground/60 mb-2 block">Prezzo (€)</label>
                  <Input
                    type="number"
                    value={listing.prezzo}
                    onChange={(e) => handleInputChange("prezzo", e.target.value)}
                    placeholder="49.99"
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-foreground/60 mb-2 block">Categoria</label>
                  <Input
                    value={listing.categoria}
                    onChange={(e) => handleInputChange("categoria", e.target.value)}
                    placeholder="Scarpe"
                    className="bg-background/50 border-border/50"
                  />
                </div>
              </div>

              {/* Conditions */}
              <div>
                <label className="text-sm text-foreground/60 mb-2 block">Condizioni</label>
                <Select value={listing.condizioni} onValueChange={(v) => handleInputChange("condizioni", v)}>
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nuovo con etichetta">Nuovo con etichetta</SelectItem>
                    <SelectItem value="Nuovo senza etichetta">Nuovo senza etichetta</SelectItem>
                    <SelectItem value="Ottime condizioni">Ottime condizioni</SelectItem>
                    <SelectItem value="Buone condizioni">Buone condizioni</SelectItem>
                    <SelectItem value="Usato">Usato</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Volume Stats Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-foreground/60 mb-2 block">Annunci simili recenti</label>
                  <Input
                    type="number"
                    value={listing.annunciSimili}
                    onChange={(e) => handleInputChange("annunciSimili", e.target.value)}
                    placeholder="5"
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-foreground/60 mb-2 block">Frequenza (annunci/giorno)</label>
                  <Input
                    type="number"
                    value={listing.frequenzaPubblicazione}
                    onChange={(e) => handleInputChange("frequenzaPubblicazione", e.target.value)}
                    placeholder="3"
                    className="bg-background/50 border-border/50"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="neon"
                  className="flex-1"
                  onClick={handleAnalyze}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analisi in corso...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Analizza Rischio
                    </>
                  )}
                </Button>
                <Button variant="glass" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-xl border border-border/50">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              {riskLevel === "low" && <CheckCircle className="w-5 h-5 text-green-500" />}
              {riskLevel === "medium" && <AlertTriangle className="w-5 h-5 text-gold" />}
              {riskLevel === "high" && <AlertTriangle className="w-5 h-5 text-neon-red" />}
              {!riskLevel && <Shield className="w-5 h-5 text-foreground/50" />}
              Analisi Rischio
            </h3>

            {!analysis && !isLoading && (
              <div className="flex flex-col items-center justify-center h-[400px] text-foreground/40">
                <Shield className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-center">
                  Inserisci i dati del tuo annuncio<br />e clicca "Analizza Rischio"
                </p>
              </div>
            )}

            {isLoading && (
              <div className="flex flex-col items-center justify-center h-[400px]">
                <Loader2 className="w-12 h-12 text-neon-red animate-spin mb-4" />
                <p className="text-foreground/60">Analisi algoritmica in corso...</p>
              </div>
            )}

            {analysis && (
              <div className="overflow-y-auto max-h-[500px] pr-2 scrollbar-thin">
                {/* Risk Badge */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
                  riskLevel === "low" 
                    ? "bg-green-500/10 border border-green-500/30 text-green-500" 
                    : riskLevel === "medium"
                    ? "bg-gold/10 border border-gold/30 text-gold"
                    : "bg-neon-red/10 border border-neon-red/30 text-neon-red"
                }`}>
                  {riskLevel === "low" && <CheckCircle className="w-4 h-4" />}
                  {riskLevel === "medium" && <AlertTriangle className="w-4 h-4" />}
                  {riskLevel === "high" && <AlertTriangle className="w-4 h-4" />}
                  <span className="font-bold uppercase text-sm">
                    {riskLevel === "low" && "Sicuro"}
                    {riskLevel === "medium" && "Rischio Medio"}
                    {riskLevel === "high" && "Alto Rischio"}
                  </span>
                </div>

                {/* Analysis Content */}
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1 className="text-xl font-bold text-foreground mt-6 mb-3">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-lg font-bold text-foreground mt-5 mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-base font-bold text-foreground mt-4 mb-2">{children}</h3>,
                      p: ({ children }) => <p className="text-foreground/80 mb-3 leading-relaxed">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-4 text-foreground/70">{children}</ul>,
                      li: ({ children }) => <li className="text-foreground/70">{children}</li>,
                      strong: ({ children }) => <strong className="text-neon-red font-bold">{children}</strong>,
                      code: ({ children }) => <code className="bg-neon-red/10 px-2 py-0.5 rounded text-neon-red text-sm">{children}</code>,
                    }}
                  >
                    {analysis}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SafeListChat;
