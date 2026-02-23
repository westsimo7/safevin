import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Sparkles, Euro, Lightbulb } from "lucide-react";
import TrustConversionSection from "./TrustConversionSection";
import KeywordIntelligence from "./KeywordIntelligence";

interface StudioOutputData {
  titolo: string;
  descrizione: string;
  bulletPoints: string[];
  trustElements?: string[];
  trustSection?: {
    buyerQuestions: string[];
    actionChecklist: string[];
    strategicScripts: { label: string; script: string }[];
  };
  keywordIntelligence?: {
    inspirationalText?: string;
    highlightedKeywords?: string[];
    mentalFilters?: {
      occasioni?: string[];
      stagione?: string[];
      outfitAbbinamenti?: string[];
      sinonimiItaliani?: string[];
      intentoAcquisto?: string[];
    };
    strategicHashtags?: string[];
  };
  suggestedPrice: { min: number; max: number; reasoning: string };
  hashtags: string[];
  category_suggestion: string;
  subcategory_suggestion: string;
  tips: string[];
}

interface StudioOutputProps {
  data: StudioOutputData;
  onNew: () => void;
  onBack: () => void;
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-muted transition-colors active:scale-95"
      aria-label="Copia"
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4 text-muted-foreground" />
      )}
    </button>
  );
};

const StudioOutput = ({ data, onNew, onBack }: StudioOutputProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <Badge className="bg-green-500/10 text-green-500 border-green-500/30 mb-4">
          <Sparkles className="w-3 h-3 mr-1" />
          Annuncio pronto
        </Badge>
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          Il tuo annuncio è pronto.
        </h2>
        <p className="text-muted-foreground">
          Copia ogni sezione e incollala direttamente su Vinted.
        </p>
      </div>

      {/* Titolo */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Titolo</p>
            <CopyButton text={data.titolo} />
          </div>
          <p className="text-lg font-bold">{data.titolo}</p>
        </CardContent>
      </Card>

      {/* Descrizione */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Descrizione</p>
            <CopyButton text={data.descrizione} />
          </div>
          <p className="text-sm whitespace-pre-line leading-relaxed">{data.descrizione}</p>
        </CardContent>
      </Card>

      {/* Bullet Points */}
      {data.bulletPoints?.length > 0 && (
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dettagli tecnici</p>
              <CopyButton text={data.bulletPoints.join("\n")} />
            </div>
            <ul className="space-y-1.5">
              {data.bulletPoints.map((bp, i) => (
                <li key={i} className="text-sm">{bp}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Keyword Intelligence — replaces old hashtag card */}
      {data.keywordIntelligence ? (
        <KeywordIntelligence data={data.keywordIntelligence} legacyHashtags={data.hashtags} />
      ) : data.hashtags?.length > 0 ? (
        <KeywordIntelligence data={{}} legacyHashtags={data.hashtags} />
      ) : null}

      {/* Price Suggestion */}
      {data.suggestedPrice && (
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Euro className="w-4 h-4 text-primary" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Prezzo suggerito</p>
            </div>
            <p className="text-2xl font-bold">
              €{data.suggestedPrice.min} – €{data.suggestedPrice.max}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{data.suggestedPrice.reasoning}</p>
          </CardContent>
        </Card>
      )}

      {/* Category */}
      {(data.category_suggestion || data.subcategory_suggestion) && (
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Categoria consigliata</p>
            <p className="text-sm font-medium">
              {data.category_suggestion}
              {data.subcategory_suggestion && ` → ${data.subcategory_suggestion}`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Trust & Conversion Section — before tips */}
      {data.trustSection && (
        <TrustConversionSection data={data.trustSection} />
      )}

      {/* Legacy fallback for old data without trustSection */}
      {!data.trustSection && data.trustElements && data.trustElements.length > 0 && (
        <TrustConversionSection
          data={{
            buyerQuestions: [],
            actionChecklist: data.trustElements,
            strategicScripts: [],
          }}
        />
      )}

      {/* Tips */}
      {data.tips?.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-primary" />
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">Consigli extra</p>
            </div>
            <ul className="space-y-2">
              {data.tips.map((tip, i) => (
                <li key={i} className="text-sm text-foreground">→ {tip}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-4">
        <Button variant="neon" size="lg" className="w-full group" onClick={onNew}>
          <Sparkles className="w-4 h-4 mr-2" />
          Crea nuovo annuncio
        </Button>
        <Button variant="glass" className="w-full" onClick={onBack}>
          Torna alla dashboard
        </Button>
      </div>
    </div>
  );
};

export default StudioOutput;
