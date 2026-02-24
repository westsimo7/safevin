import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Copy, Check, Sparkles, Euro, Lightbulb, Type, FileText, FolderOpen,
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
    keywordBlock?: string;
    strategicHashtags?: string[];
    // legacy
    inspirationalText?: string;
    highlightedKeywords?: string[];
    mentalFilters?: any;
  };
  suggestedPrice: { min: number; max: number; reasoning: string };
  hashtags: string[];
  category_suggestion: string;
  subcategory_suggestion: string;
  category_reasoning?: string;
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
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
          <h3 className="text-base font-bold tracking-tight">{label}</h3>
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
  // Build context string for keyword generation
  const outputContext = `Titolo: ${data.titolo}. Categoria: ${data.category_suggestion}. Descrizione breve: ${data.descrizione?.slice(0, 200)}`;

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
        <p className="text-lg font-normal leading-snug">{data.titolo}</p>
      </SectionBlock>

      {/* Descrizione + Dettagli tecnici */}
      <SectionBlock
        icon={<FileText className="w-4 h-4 text-primary" />}
        label="Descrizione"
        copyText={
          data.bulletPoints?.length > 0
            ? `${data.descrizione}\n\n${data.bulletPoints.map(bp => `• ${bp.replace(/^•\s*/, "")}`).join("\n")}`
            : data.descrizione
        }
      >
        <p className="text-sm whitespace-pre-line leading-relaxed text-foreground/90">{data.descrizione}</p>
        {data.bulletPoints?.length > 0 && (
          <>
            <div className="border-t border-primary/10 my-3" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Dettagli tecnici</p>
            <ul className="space-y-1.5">
              {data.bulletPoints.map((bp, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                  <span className="text-primary/60 mt-0.5">•</span>
                  <span>{bp.replace(/^•\s*/, "")}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </SectionBlock>

      {/* Prezzo suggerito */}
      {data.suggestedPrice && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Euro className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-base font-bold tracking-tight">Prezzo suggerito</h3>
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

      {/* Categoria consigliata intelligente */}
      {data.category_suggestion && (
        <SectionBlock icon={<FolderOpen className="w-4 h-4 text-primary" />} label="Categoria consigliata">
          <p className="text-sm font-semibold mb-1">
            {data.category_suggestion}
          </p>
          {data.category_reasoning && (
            <p className="text-xs text-muted-foreground leading-relaxed mt-2">
              {data.category_reasoning}
            </p>
          )}
        </SectionBlock>
      )}

      {/* Keyword Intelligence - blocco unico */}
      {data.keywordIntelligence ? (
        <KeywordIntelligence
          data={data.keywordIntelligence}
          legacyHashtags={data.hashtags}
          outputContext={outputContext}
        />
      ) : data.hashtags?.length > 0 ? (
        <KeywordIntelligence data={{}} legacyHashtags={data.hashtags} outputContext={outputContext} />
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
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-base font-bold tracking-tight text-primary">Consigli extra</h3>
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
