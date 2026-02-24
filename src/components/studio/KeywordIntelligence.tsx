import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, Search, Hash, Wand2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface KeywordIntelligenceData {
  keywordBlock?: string;
  strategicHashtags?: string[];
  // legacy fields
  inspirationalText?: string;
  highlightedKeywords?: string[];
  mentalFilters?: any;
}

interface KeywordIntelligenceProps {
  data: KeywordIntelligenceData;
  legacyHashtags?: string[];
  outputContext?: string;
}

const CopyBtn = ({ text }: { text: string }) => {
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

const KeywordIntelligence = ({ data, legacyHashtags, outputContext }: KeywordIntelligenceProps) => {
  const hashtags = data.strategicHashtags || legacyHashtags || [];
  const initialBlock = data.keywordBlock || "";

  const [variants, setVariants] = useState<string[]>(initialBlock ? [initialBlock] : []);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const canGenerate = variants.length < 4;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("safelist-studio", {
        body: {
          action: "generate_keyword_text",
          keywordBlock: variants.length > 0 ? variants[variants.length - 1] : "",
          outputContext: outputContext || "",
        },
      });
      if (!error && result?.text) {
        const newVariants = [...variants, result.text];
        setVariants(newVariants);
        setActiveIndex(newVariants.length - 1);
      }
    } catch (e) {
      console.error("Generate keyword text error:", e);
    } finally {
      setLoading(false);
    }
  };

  const goTo = (idx: number) => {
    if (idx >= 0 && idx < variants.length) setActiveIndex(idx);
  };

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Hashtag & Keyword Intelligence</h3>
              <p className="text-xs text-muted-foreground">Intercetta ricerche dirette, emozionali e per occasione in un unico blocco strategico.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-primary/10 pt-3">
          {/* Keyword block with generation carousel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Consigliato alla fine dell'annuncio per intercettare ricerche dirette e correlate senza appesantire la parte narrativa iniziale.
              </p>
            </div>

            {/* Generated variants carousel */}
            {variants.length > 0 && (
              <div className="relative">
                {/* Navigation arrows */}
                {variants.length > 1 && (
                  <>
                    <button
                      onClick={() => goTo(activeIndex - 1)}
                      disabled={activeIndex === 0}
                      className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-background border border-border/50 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => goTo(activeIndex + 1)}
                      disabled={activeIndex === variants.length - 1}
                      className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-background border border-border/50 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                <div ref={scrollRef} className="overflow-hidden rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm leading-relaxed text-foreground/90">{variants[activeIndex]}</p>
                    <CopyBtn text={variants[activeIndex]} />
                  </div>
                </div>

                {/* Dots indicator */}
                {variants.length > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    {variants.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => goTo(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${i === activeIndex ? "bg-primary" : "bg-border"}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Generate button */}
            {canGenerate && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                disabled={loading}
                className="w-full border-primary/20 hover:bg-primary/10 text-primary"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5 mr-2" />
                )}
                {variants.length === 0 ? "Genera testo keyword" : `Genera variante (${variants.length}/4)`}
              </Button>
            )}
          </div>
        </div>

        {/* Strategic Hashtags */}
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
      </CardContent>
    </Card>
  );
};

export default KeywordIntelligence;
