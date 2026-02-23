import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Copy, Check, Sparkles, Euro, Lightbulb, Type, FileText, List, FolderOpen,
} from "lucide-react";
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
    <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-muted transition-colors active:scale-95" aria-label="Copia">
      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
    </button>
  );
};

const SectionBlock = ({
  icon,
  label,
  copyText,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  copyText?: string;
  children: React.ReactNode;
}) => (
  <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
    <CardContent className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        </div>
        {copyText && <CopyButton text={copyText} />}
      </div>
      <div className="border-t border-primary/10 pt-3">
        {children}
      </div>
    </CardContent>
  </Card>
);

const StudioOutput = ({ data, onNew, onBack }: StudioOutputProps) => {
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="text-center pb-2">
        <Badge className="bg-green-500/10 text-green-500 border-green-500/30 mb-4">
          <Sparkles className="w-3 h-3 mr-1" />
          Annuncio pronto
        </Badge>
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Il tuo annuncio è pronto.</h2>
        <p className="text-sm text-muted-foreground">Copia ogni sezione e incollala direttamente su Vinted.</p>
      </div>

      {/* Titolo */}
      <SectionBlock icon={<Type className="w-4 h-4 text-primary" />} label="Titolo" copyText={data.titolo}>
        <p className="text-lg font-bold leading-snug">{data.titolo}</p>
      </SectionBlock>

      {/* Descrizione */}
      <SectionBlock icon={<FileText className="w-4 h-4 text-primary" />} label="Descrizione" copyText={data.descrizione}>
        <p className="text-sm whitespace-pre-line leading-relaxed text-foreground/90">{data.descrizione}</p>
      </SectionBlock>

      {/* Dettagli tecnici */}
      {data.bulletPoints?.length > 0 && (
        <SectionBlock icon={<List className="w-4 h-4 text-primary" />} label="Dettagli tecnici" copyText={data.bulletPoints.join("\n")}>
          <ul className="space-y-1.5">
            {data.bulletPoints.map((bp, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                <span className="text-primary/60 mt-0.5">•</span>
                <span>{bp.replace(/^•\s*/, "")}</span>
              </li>
            ))}
          </ul>
        </SectionBlock>
      )}

      {/* Prezzo suggerito */}
      {data.suggestedPrice && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                <Euro className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Prezzo suggerito</p>
            </div>
            <div className="border-t border-primary/10 pt-3">
            <p className="text-3xl font-bold tracking-tight">
              €{data.suggestedPrice.min} <span className="text-muted-foreground font-normal text-lg">–</span> €{data.suggestedPrice.max}
            </p>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{data.suggestedPrice.reasoning}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categoria consigliata */}
      {(data.category_suggestion || data.subcategory_suggestion) && (
        <SectionBlock icon={<FolderOpen className="w-4 h-4 text-primary" />} label="Categoria consigliata">
          <p className="text-sm font-medium">
            {data.category_suggestion}
            {data.subcategory_suggestion && (
              <span className="text-muted-foreground"> → </span>
            )}
            {data.subcategory_suggestion && (
              <span>{data.subcategory_suggestion}</span>
            )}
          </p>
        </SectionBlock>
      )}

      {/* Keyword Intelligence */}
      {data.keywordIntelligence ? (
        <KeywordIntelligence data={data.keywordIntelligence} legacyHashtags={data.hashtags} />
      ) : data.hashtags?.length > 0 ? (
        <KeywordIntelligence data={{}} legacyHashtags={data.hashtags} />
      ) : null}

      {/* Trust & Conversion */}
      {data.trustSection && (
        <TrustConversionSection data={data.trustSection} />
      )}
      {!data.trustSection && data.trustElements && data.trustElements.length > 0 && (
        <TrustConversionSection
          data={{ buyerQuestions: [], actionChecklist: data.trustElements, strategicScripts: [] }}
        />
      )}

      {/* Consigli extra */}
      {data.tips?.length > 0 && (
        <Card className="border-primary/20 bg-primary/5 overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">Consigli extra</p>
            </div>
            <ul className="space-y-2">
              {data.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="text-primary mt-0.5">→</span>
                  <span>{tip}</span>
                </li>
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