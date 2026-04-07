import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { ProductAnalysis } from "./StudioRecognition";
import MeasurementGuideDialog from "./MeasurementGuideDialog";

export interface StudioUserInput {
  size: string;
  gender: string;
  condition: string;
  materials: string;
  minPrice: string;
  measurements: Record<string, string>;
  extras: string;
}

const UPPER_BODY_KEYWORDS = [
  "t-shirt", "maglietta", "maglia", "felpa", "giacca", "giubbotto", "cappotto",
  "blazer", "camicia", "polo", "top", "canotta", "maglione", "pullover",
  "cardigan", "gilet", "piumino", "parka", "bomber", "hoodie", "sweatshirt",
  "crop top", "body", "blusa", "vestaglia", "kimono",
];

const LOWER_BODY_KEYWORDS = [
  "pantalone", "pantaloni", "jeans", "gonna", "shorts", "pantaloncini",
  "leggings", "bermuda", "cargo", "chino", "jogger", "skort",
];

function getGarmentZone(category: string, productType: string): "upper" | "lower" | "unknown" {
  const text = `${category} ${productType}`.toLowerCase();
  if (LOWER_BODY_KEYWORDS.some(k => text.includes(k))) return "lower";
  if (UPPER_BODY_KEYWORDS.some(k => text.includes(k))) return "upper";
  return "unknown";
}

const SIZES_UPPER_UNISEX = [
  "XS", "S", "M", "L", "XL", "XXL", "XXXL",
  "4XL", "5XL", "6XL", "7XL", "8XL", "Taglia unica",
];

const SIZES_LOWER_UOMO = [
  "IT 32 | W23", "IT 34 | W24", "IT 34 | W25", "IT 36 | W26", "IT 36 | W27",
  "IT 38 | W28", "IT 38 | W29", "IT 40 | W30", "IT 40 | W31", "IT 42 | W32",
  "IT 42 | W33", "IT 44 | W34", "IT 44 | W35", "IT 46 | W36", "IT 48 | W38",
  "IT 50 | W40", "IT 52 | W42", "IT 54 | W44", "IT 56 | W46", "IT 58 | W48",
  "IT 60 | W50", "IT 62 | W52", "IT 64 | W54",
];

const SIZES_DONNA = [
  "XXXS / IT 34 / EU 30", "XXS / IT 36 / EU 32", "XS / IT 38 / EU 34",
  "S / IT 40 / EU 36", "M / IT 42 / EU 38", "L / IT 44 / EU 40",
  "XL / IT 46 / EU 42", "XXL / IT 48 / EU 44", "XXXL / IT 50 / EU 46",
  "4XL / IT 52 / EU 48", "5XL / IT 54 / EU 50", "6XL / IT 56 / EU 52",
  "7XL / IT 58 / EU 54", "8XL / IT 60 / EU 56", "9XL / IT 62 / EU 58",
  "Taglia unica", "Altro",
];

function getSizeOptions(gender: string, zone: "upper" | "lower" | "unknown"): string[] {
  if (gender === "donna") return SIZES_DONNA;
  if (gender === "uomo") {
    if (zone === "lower") return SIZES_LOWER_UOMO;
    return SIZES_UPPER_UNISEX;
  }
  return SIZES_UPPER_UNISEX;
}

interface StudioInputProps {
  analysis: ProductAnalysis;
  onContinue: (input: StudioUserInput) => void;
  onBack: () => void;
  auditSource?: {
    condizioni: string;
    prezzo: string;
  };
}

const CONDITION_OPTIONS = [
  { value: "nuovo_cartellino", label: "Nuovo con cartellino" },
  { value: "nuovo_senza_cartellino", label: "Nuovo senza cartellino" },
  { value: "ottime", label: "Ottime condizioni" },
  { value: "buone", label: "Buone condizioni" },
  { value: "discrete", label: "Condizioni discrete" },
];

const GENDER_OPTIONS = [
  { value: "uomo", label: "Uomo" },
  { value: "donna", label: "Donna" },
];

const StudioInput = ({ analysis, onContinue, onBack, auditSource }: StudioInputProps) => {
  const getInitialCondition = () => {
    if (!auditSource?.condizioni) return "";
    const c = auditSource.condizioni.toLowerCase();
    const match = CONDITION_OPTIONS.find(o => c.includes(o.label.toLowerCase()));
    return match?.value || "";
  };

  const [size, setSize] = useState("");
  const [gender, setGender] = useState("");
  const [condition, setCondition] = useState(getInitialCondition());
  const [materials, setMaterials] = useState(analysis.materials || "");
  const [minPrice, setMinPrice] = useState(auditSource?.prezzo || "");
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [extras, setExtras] = useState("");
  const [showGuide, setShowGuide] = useState(false);

  const canContinue = size && gender && condition && materials && minPrice;

  const handleContinue = () => {
    onContinue({
      size,
      gender: GENDER_OPTIONS.find(g => g.value === gender)?.label || gender,
      condition: CONDITION_OPTIONS.find(c => c.value === condition)?.label || condition,
      materials,
      minPrice,
      measurements,
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
          Compila i campi obbligatori, il resto lo facciamo noi
        </p>
      </div>

      {/* Required fields */}
      <Card className="border-border/50">
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Genere *</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger>
                <SelectValue placeholder="Uomo o Donna?" />
              </SelectTrigger>
              <SelectContent>
                {GENDER_OPTIONS.map(g => (
                  <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Taglia *</Label>
            <Input
              value={size}
              onChange={e => setSize(e.target.value)}
              placeholder="es. M, 42, Taglia unica..."
            />
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
            <Label className="text-sm font-medium">Materiali *</Label>
            <Input
              value={materials}
              onChange={e => setMaterials(e.target.value)}
              placeholder="es. cotone, poliestere, pelle..."
            />
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

      {/* Measurements (optional) */}
      <Card className="border-border/50">
        <CardContent className="p-4 space-y-4">
          <Label className="text-sm font-medium">Misure (facoltativo)</Label>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Label className="text-xs text-muted-foreground w-40 shrink-0">Ampiezza delle spalle</Label>
              <Input
                type="number"
                placeholder="es. 46"
                value={measurements["Ampiezza delle spalle"] || ""}
                onChange={e => setMeasurements(prev => ({ ...prev, "Ampiezza delle spalle": e.target.value }))}
                className="h-9 text-sm"
              />
              <span className="text-xs text-muted-foreground">cm</span>
            </div>
            <div className="flex items-center gap-3">
              <Label className="text-xs text-muted-foreground w-40 shrink-0">Lunghezza</Label>
              <Input
                type="number"
                placeholder="es. 70"
                value={measurements["Lunghezza"] || ""}
                onChange={e => setMeasurements(prev => ({ ...prev, "Lunghezza": e.target.value }))}
                className="h-9 text-sm"
              />
              <span className="text-xs text-muted-foreground">cm</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowGuide(true)}
            className="text-xs text-primary hover:underline mt-1"
          >
            📏 Scopri come misurare correttamente il tuo articolo. <span className="font-semibold">Leggi la nostra guida alle misure</span>
          </button>
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

      <MeasurementGuideDialog open={showGuide} onOpenChange={setShowGuide} />
    </div>
  );
};

export default StudioInput;
