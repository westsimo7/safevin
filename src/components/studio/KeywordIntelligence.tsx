import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Search, Calendar, Shirt, Languages, ShoppingCart, Sparkles, Hash, Wand2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface KeywordIntelligenceData {
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
}

interface KeywordIntelligenceProps {
  data: KeywordIntelligenceData;
  legacyHashtags?: string[];
}

const CopyBtn = ({ text, label = "Copia" }: { text: string; label?: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    const plain = text.replace(/<[^>]*>/g, "");
    await navigator.clipboard.writeText(plain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-muted transition-colors active:scale-95" aria-label={label}>
      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
    </button>
  );
};

const FilterBlock = ({ icon, title, keywords }: { icon: React.ReactNode; title: string; keywords: string[] }) => {
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-filter-text", {
        body: { category: title, keywords },
      });
      if (!error && data?.text) {
        setGeneratedText(data.text);
      }
    } catch (e) {
      console.error("Generate filter text error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedText) return;
    await navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
          Genera
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground/60 leading-snug">
        Genera un micro-testo che integra queste keyword per arricchire il tuo annuncio.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {keywords.map((kw, i) => (
          <Badge key={i} variant="outline" className="text-xs font-normal bg-muted/40 border-border/50 text-foreground/80">
            {kw}
          </Badge>
        ))}
      </div>
      {generatedText && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 mt-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm leading-relaxed text-foreground/90">{generatedText}</p>
            <button onClick={handleCopy} className="p-1 rounded-md hover:bg-muted transition-colors active:scale-95 shrink-0" aria-label="Copia">
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const HighlightedText = ({ text, keywords }: { text: string; keywords: string[] }) => {
  const parts = useMemo(() => {
    if (!keywords || keywords.length === 0) return [{ text, highlight: false }];

    // Sort keywords by length descending so longer matches take priority
    const sorted = [...keywords].sort((a, b) => b.length - a.length);
    const escaped = sorted.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const regex = new RegExp(`(${escaped.join("|")})`, "gi");

    const result: { text: string; highlight: boolean }[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        result.push({ text: text.slice(lastIndex, match.index), highlight: false });
      }
      result.push({ text: match[0], highlight: true });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      result.push({ text: text.slice(lastIndex), highlight: false });
    }
    return result;
  }, [text, keywords]);

  return (
    <p className="text-sm leading-relaxed">
      {parts.map((part, i) =>
        part.highlight ? (
          <span key={i} className="border border-destructive/40 bg-destructive/10 rounded px-0.5 text-foreground font-medium">
            {part.text}
          </span>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </p>
  );
};

const KeywordIntelligence = ({ data, legacyHashtags }: KeywordIntelligenceProps) => {
  const hashtags = data.strategicHashtags || legacyHashtags || [];
  const filters = data.mentalFilters;
  const hasFilters = filters && (
    (filters.occasioni?.length ?? 0) > 0 ||
    (filters.stagione?.length ?? 0) > 0 ||
    (filters.outfitAbbinamenti?.length ?? 0) > 0 ||
    (filters.sinonimiItaliani?.length ?? 0) > 0 ||
    (filters.intentoAcquisto?.length ?? 0) > 0
  );

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
      <CardContent className="p-5 space-y-5">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Hashtag & Keyword Intelligence</h3>
              <p className="text-xs text-muted-foreground">Intercetta ricerche dirette, emozionali e per occasione.</p>
            </div>
          </div>
        </div>

        {/* 1. Inspirational Keywords Text */}
        {data.inspirationalText && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Keyword Ispirazionali</p>
              </div>
              <CopyBtn text={data.inspirationalText} />
            </div>
            <div className="rounded-lg border border-border/30 bg-muted/20 p-3">
              <HighlightedText text={data.inspirationalText} keywords={data.highlightedKeywords || []} />
              <p className="text-[10px] text-muted-foreground/60 mt-2 italic">
                Le keyword evidenziate in rosso non vengono copiate con la formattazione.
              </p>
            </div>
          </div>
        )}

        {/* 2. Mental Filters */}
        {hasFilters && (
          <>
            <div className="border-t border-border/30" />
            <div className="space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filtri Mentali</p>

              {filters!.occasioni && filters!.occasioni.length > 0 && (
                <FilterBlock
                  icon={<Calendar className="w-3.5 h-3.5 text-primary/70" />}
                  title="Occasioni"
                  keywords={filters!.occasioni}
                />
              )}
              {filters!.stagione && filters!.stagione.length > 0 && (
                <FilterBlock
                  icon={<Calendar className="w-3.5 h-3.5 text-primary/70" />}
                  title="Stagione"
                  keywords={filters!.stagione}
                />
              )}
              {filters!.outfitAbbinamenti && filters!.outfitAbbinamenti.length > 0 && (
                <FilterBlock
                  icon={<Shirt className="w-3.5 h-3.5 text-primary/70" />}
                  title="Outfit & Abbinamenti"
                  keywords={filters!.outfitAbbinamenti}
                />
              )}
              {filters!.sinonimiItaliani && filters!.sinonimiItaliani.length > 0 && (
                <FilterBlock
                  icon={<Languages className="w-3.5 h-3.5 text-primary/70" />}
                  title="Sinonimi Italiani"
                  keywords={filters!.sinonimiItaliani}
                />
              )}
              {filters!.intentoAcquisto && filters!.intentoAcquisto.length > 0 && (
                <FilterBlock
                  icon={<ShoppingCart className="w-3.5 h-3.5 text-primary/70" />}
                  title="Intento d'Acquisto"
                  keywords={filters!.intentoAcquisto}
                />
              )}
            </div>
          </>
        )}

        {/* 3. Strategic Hashtags */}
        {hashtags.length > 0 && (
          <>
            <div className="border-t border-border/30" />
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-primary" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hashtag Strategici</p>
                </div>
                <CopyBtn text={hashtags.join(" ")} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {hashtags.map((tag, i) => (
                  <Badge key={i} className="bg-primary/10 text-primary border-primary/20 text-xs font-normal">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 4. Keyword Summary */}
        {data.highlightedKeywords && data.highlightedKeywords.length > 0 && (
          <>
            <div className="border-t border-border/30" />
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Keyword Chiave Rilevate</p>
                <CopyBtn text={data.highlightedKeywords.join(", ")} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {data.highlightedKeywords.map((kw, i) => (
                  <Badge key={i} variant="outline" className="text-xs font-normal border-destructive/30 text-destructive bg-destructive/5">
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default KeywordIntelligence;