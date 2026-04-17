import { useState, useMemo } from "react";
import { ArrowRight, Check, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { ProductAnalysis } from "./StudioRecognition";
import MeasurementGuideDialog from "./MeasurementGuideDialog";

export interface StudioUserInput {
  size: string;
  gender: string;
  productType: string;
  fit: string;
  style: string;
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

const STYLE_OPTIONS = [
  { value: "vintage", label: "Vintage" },
  { value: "casual", label: "Casual" },
  { value: "streetwear", label: "Streetwear" },
  { value: "elegante", label: "Elegante" },
];

const FIT_OPTIONS = [
  "Slim fit", "Regular fit", "Oversize fit", "Boxy fit", "Relaxed fit",
  "Skinny fit", "Straight fit", "Tapered fit", "Cropped fit", "Wide fit",
];

const MATERIAL_OPTIONS = [
  "Acrilico", "Alpaca", "Camoscio", "Canvas", "Cashmere", "Chiffon", "Cotone",
  "Denim", "Elastane", "Feltro", "Finta pelliccia", "Flanella", "Juta", "Lana",
  "Lino", "Merino", "Mohair", "Neoprene", "Nylon", "Paglia", "Paillette",
  "Pelle", "Pelle verniciata", "Pile", "Piumino", "Pizzo", "Poliestere",
  "Raso", "Rete", "Seta", "Similpelle", "Tulle", "Tweed", "Velluto",
  "Velluto a coste", "Velour", "Viscosa",
];

const StudioInput = ({ analysis, onContinue, onBack, auditSource }: StudioInputProps) => {
  const getInitialCondition = () => {
    if (!auditSource?.condizioni) return "";
    const c = auditSource.condizioni.toLowerCase();
    const match = CONDITION_OPTIONS.find(o => c.includes(o.label.toLowerCase()));
    return match?.value || "";
  };

  const zone = getGarmentZone(analysis.category, analysis.product_type);
  const [size, setSize] = useState("");
  const [gender, setGender] = useState("");
  const [productType, setProductType] = useState(analysis.product_type || "");
  const [fit, setFit] = useState("");
  const [style, setStyle] = useState("");
  const [condition, setCondition] = useState(getInitialCondition());
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(() => {
    const init = analysis.materials || "";
    return init ? init.split(",").map(s => s.trim()).filter(Boolean).slice(0, 3) : [];
  });
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const [materialSearch, setMaterialSearch] = useState("");
  const [minPrice, setMinPrice] = useState(auditSource?.prezzo || "");
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [extras, setExtras] = useState("");
  const [showGuide, setShowGuide] = useState(false);

  const toggleMaterial = (mat: string) => {
    setSelectedMaterials(prev => {
      if (prev.includes(mat)) return prev.filter(m => m !== mat);
      if (prev.length >= 3) return prev;
      return [...prev, mat];
    });
  };

  const canContinue = size && gender && productType && fit && style && condition && selectedMaterials.length > 0 && minPrice;

  const handleContinue = () => {
    onContinue({
      size,
      gender: GENDER_OPTIONS.find(g => g.value === gender)?.label || gender,
      productType,
      fit,
      style: STYLE_OPTIONS.find(s => s.value === style)?.label || style,
      condition: CONDITION_OPTIONS.find(c => c.value === condition)?.label || condition,
      materials: selectedMaterials.join(", "),
      minPrice,
      measurements,
      extras,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
          Fase 3 di 3
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
            <Select value={gender} onValueChange={(v) => { setGender(v); setSize(""); }}>
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
            <Select value={size} onValueChange={setSize} disabled={!gender}>
              <SelectTrigger>
                <SelectValue placeholder={gender ? "Seleziona taglia" : "Seleziona prima il genere"} />
              </SelectTrigger>
              <SelectContent>
                {getSizeOptions(gender, zone).map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 rounded-lg border-2 border-amber-500/60 bg-amber-500/5 shadow-[0_0_14px_-3px_hsl(45_95%_55%/0.5)] p-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <Label className="text-sm font-medium shrink-0">Tipologia prodotto *</Label>
              <div className="flex-1 overflow-hidden relative h-4">
                <div className="absolute whitespace-nowrap text-[11px] text-amber-500 animate-[scroll-left_14s_linear_infinite]">
                  ⚠ Controlla se la categoria è giusta, l'IA potrebbe confondersi · ⚠ Controlla se la categoria è giusta, l'IA potrebbe confondersi ·
                </div>
              </div>
            </div>
            <Input
              value={productType}
              onChange={e => setProductType(e.target.value)}
              placeholder="Es: Felpa con cappuccio, Giacca bomber, Jeans skinny..."
              className="text-sm border-amber-500/40 focus-visible:ring-amber-500/40"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Fit *</Label>
            <Input
              value={fit}
              onChange={e => setFit(e.target.value)}
              placeholder="Es: Oversize, Slim fit, Regular..."
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Stile *</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona stile" />
              </SelectTrigger>
              <SelectContent>
                {STYLE_OPTIONS.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
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
            <Label className="text-sm font-medium">
              Materiali * <span className="text-xs text-muted-foreground font-normal">(max 3)</span>
            </Label>
            <Popover open={materialsOpen} onOpenChange={(open) => { setMaterialsOpen(open); if (!open) setMaterialSearch(""); }}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={materialsOpen}
                  className="w-full justify-between h-10 font-normal text-sm"
                >
                  {selectedMaterials.length > 0
                    ? selectedMaterials.join(", ")
                    : <span className="text-muted-foreground">Seleziona materiali...</span>}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 max-h-[280px] overflow-hidden" align="start" side="bottom" sideOffset={4}>
                <div className="p-2 border-b border-border/50">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      value={materialSearch}
                      onChange={e => setMaterialSearch(e.target.value)}
                      placeholder="Cerca materiale..."
                      className="h-8 pl-8 text-sm"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="p-1 max-h-[220px] overflow-y-auto">
                  {MATERIAL_OPTIONS
                    .filter(mat => mat.toLowerCase().includes(materialSearch.toLowerCase()))
                    .map(mat => (
                    <button
                      key={mat}
                      type="button"
                      onClick={() => toggleMaterial(mat)}
                      disabled={!selectedMaterials.includes(mat) && selectedMaterials.length >= 3}
                      className={cn(
                        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        "disabled:pointer-events-none disabled:opacity-40",
                        selectedMaterials.includes(mat) && "bg-accent/50"
                      )}
                    >
                      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                        {selectedMaterials.includes(mat) && <Check className="h-4 w-4" />}
                      </span>
                      {mat}
                    </button>
                  ))}
                  {MATERIAL_OPTIONS.filter(mat => mat.toLowerCase().includes(materialSearch.toLowerCase())).length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-3">Nessun materiale trovato</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            {selectedMaterials.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {selectedMaterials.map(mat => (
                  <Badge
                    key={mat}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-destructive/20"
                    onClick={() => toggleMaterial(mat)}
                  >
                    {mat} ✕
                  </Badge>
                ))}
              </div>
            )}
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

      {/* Measurements (optional) — only for upper body */}
      {zone !== "lower" && (
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
      )}

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
