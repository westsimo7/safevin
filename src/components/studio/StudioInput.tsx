import { useState, useMemo } from "react";
import { ArrowRight, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { ProductAnalysis } from "./StudioRecognition";

export interface StudioUserInput {
  size: string;
  condition: string;
  minPrice: string;
  measurements: Record<string, string>;
  context: string;
  extras: string;
}

interface StudioInputProps {
  analysis: ProductAnalysis;
  onContinue: (input: StudioUserInput) => void;
  onBack: () => void;
}

const SIZE_OPTIONS = [
  "XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL",
  "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "48", "50", "52",
  "Taglia unica",
];

const CONDITION_OPTIONS = [
  { value: "nuovo_cartellino", label: "Nuovo con cartellino" },
  { value: "nuovo_senza_cartellino", label: "Nuovo senza cartellino" },
  { value: "ottime", label: "Ottime condizioni" },
  { value: "buone", label: "Buone condizioni" },
  { value: "discrete", label: "Condizioni discrete" },
];

const MEASUREMENT_FIELDS: Record<string, { label: string; placeholder: string }[]> = {
  maglietta: [
    { label: "Larghezza petto", placeholder: "es. 52" },
    { label: "Lunghezza", placeholder: "es. 70" },
  ],
  felpa: [
    { label: "Larghezza petto", placeholder: "es. 56" },
    { label: "Lunghezza", placeholder: "es. 72" },
    { label: "Maniche", placeholder: "es. 64" },
  ],
  giacca: [
    { label: "Spalle", placeholder: "es. 46" },
    { label: "Maniche", placeholder: "es. 63" },
    { label: "Lunghezza", placeholder: "es. 75" },
    { label: "Petto", placeholder: "es. 54" },
  ],
  pantaloni: [
    { label: "Vita", placeholder: "es. 42" },
    { label: "Lunghezza", placeholder: "es. 102" },
    { label: "Cavallo", placeholder: "es. 30" },
  ],
  scarpe: [
    { label: "Lunghezza suola (cm)", placeholder: "es. 28" },
  ],
  borsa: [
    { label: "Larghezza", placeholder: "es. 35" },
    { label: "Altezza", placeholder: "es. 25" },
    { label: "Profondità", placeholder: "es. 12" },
  ],
};

function getMeasurementFields(productType: string) {
  const key = productType.toLowerCase();
  for (const [k, fields] of Object.entries(MEASUREMENT_FIELDS)) {
    if (key.includes(k)) return fields;
  }
  // Default generic
  return [
    { label: "Larghezza", placeholder: "es. 50" },
    { label: "Lunghezza", placeholder: "es. 70" },
  ];
}

const CONTEXT_SUGGESTIONS = [
  "Uso quotidiano",
  "Outfit streetwear",
  "Palestra / sport",
  "Inverno / freddo",
  "Occasione elegante",
  "Casual estivo",
  "Lavoro / ufficio",
];

const StudioInput = ({ analysis, onContinue, onBack }: StudioInputProps) => {
  const [size, setSize] = useState("");
  const [condition, setCondition] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [context, setContext] = useState("");
  const [extras, setExtras] = useState("");
  const [showMeasurements, setShowMeasurements] = useState(false);

  const measurementFields = useMemo(
    () => getMeasurementFields(analysis.product_type || ""),
    [analysis.product_type]
  );

  const canContinue = size && condition && minPrice;

  const handleContinue = () => {
    onContinue({
      size,
      condition: CONDITION_OPTIONS.find(c => c.value === condition)?.label || condition,
      minPrice,
      measurements,
      context,
      extras,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
          Fase 3
        </Badge>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Ultimi dettagli</h2>
        <p className="text-sm text-muted-foreground">
          Solo 3 informazioni obbligatorie, il resto lo facciamo noi
        </p>
      </div>

      {/* Required fields */}
      <Card className="border-border/50">
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Taglia *</Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona taglia" />
              </SelectTrigger>
              <SelectContent>
                {SIZE_OPTIONS.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Condizione *</Label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona condizione" />
              </SelectTrigger>
              <SelectContent>
                {CONDITION_OPTIONS.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Prezzo minimo accettato (€) *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
              <Input
                type="number"
                min={1}
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                placeholder="es. 15"
                className="pl-8"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optional measurements */}
      <Collapsible open={showMeasurements} onOpenChange={setShowMeasurements}>
        <Card className="border-border/50">
          <CollapsibleTrigger className="w-full">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Misure (facoltativo)</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {showMeasurements ? "Chiudi" : "Aggiungi"}
              </span>
            </CardContent>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="px-4 pb-4 pt-0 space-y-3">
              <p className="text-xs text-muted-foreground">
                Misure suggerite per {analysis.product_type?.toLowerCase() || "questo prodotto"} (in cm)
              </p>
              {measurementFields.map(field => (
                <div key={field.label} className="flex items-center gap-3">
                  <Label className="text-xs text-muted-foreground w-32 shrink-0">{field.label}</Label>
                  <Input
                    type="number"
                    placeholder={field.placeholder}
                    value={measurements[field.label] || ""}
                    onChange={e => setMeasurements(prev => ({ ...prev, [field.label]: e.target.value }))}
                    className="h-9 text-sm"
                  />
                  <span className="text-xs text-muted-foreground">cm</span>
                </div>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Context */}
      <Card className="border-border/50">
        <CardContent className="p-4 space-y-3">
          <Label className="text-sm font-medium">Contesto d'uso (facoltativo)</Label>
          <div className="flex flex-wrap gap-2">
            {CONTEXT_SUGGESTIONS.map(sug => (
              <button
                key={sug}
                onClick={() => setContext(prev => prev.includes(sug) ? prev.replace(sug, "").trim() : (prev ? prev + ", " + sug : sug))}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  context.includes(sug)
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-muted/20 border-border/50 text-muted-foreground hover:bg-muted/40"
                }`}
              >
                {sug}
              </button>
            ))}
          </div>
          <Input
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="es. perfetto per outfit casual invernali"
            className="text-sm"
          />
        </CardContent>
      </Card>

      {/* Extras */}
      <Card className="border-border/50">
        <CardContent className="p-4 space-y-2">
          <Label className="text-sm font-medium">Info extra (facoltativo)</Label>
          <Textarea
            value={extras}
            onChange={e => setExtras(e.target.value)}
            placeholder="Aggiungi dettagli personali, es. 'indossato solo 2 volte', 'regalo non gradito'..."
            rows={2}
            className="text-sm resize-none"
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <Button
        variant="neon"
        size="lg"
        className="w-full"
        disabled={!canContinue}
        onClick={handleContinue}
      >
        Genera annuncio
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>

      <Button variant="ghost" className="w-full text-muted-foreground" onClick={onBack}>
        ← Torna indietro
      </Button>
    </div>
  );
};

export default StudioInput;
