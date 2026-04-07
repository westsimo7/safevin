import { useState } from "react";
import { Check, Pencil, Sparkles, ArrowRight, HelpCircle, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const VINTED_COLORS: { label: string; hex: string }[] = [
  { label: "Nero", hex: "#000000" },
  { label: "Grigio", hex: "#808080" },
  { label: "Bianco", hex: "#FFFFFF" },
  { label: "Panna", hex: "#FFFDD0" },
  { label: "Beige", hex: "#D2B48C" },
  { label: "Albicocca", hex: "#FBCEB1" },
  { label: "Arancione", hex: "#FF8C00" },
  { label: "Corallo", hex: "#FF6F61" },
  { label: "Rosso", hex: "#D32F2F" },
  { label: "Borgogna", hex: "#800020" },
  { label: "Rosa", hex: "#F48FB1" },
  { label: "Viola", hex: "#7B1FA2" },
  { label: "Lilla", hex: "#C8A2C8" },
  { label: "Azzurro", hex: "#87CEEB" },
  { label: "Blu", hex: "#1565C0" },
  { label: "Blu marino", hex: "#1B2A4A" },
  { label: "Turchese", hex: "#00BCD4" },
  { label: "Menta", hex: "#98FF98" },
  { label: "Verde", hex: "#4CAF50" },
  { label: "Verde scuro", hex: "#1B5E20" },
  { label: "Cachi", hex: "#BDB76B" },
  { label: "Marrone", hex: "#6D4C41" },
  { label: "Senape", hex: "#FFDB58" },
  { label: "Giallo", hex: "#FFEB3B" },
  { label: "Argento", hex: "#C0C0C0" },
  { label: "Oro", hex: "#FFD700" },
  { label: "Multi color", hex: "linear-gradient(135deg, #FF0000, #FF8C00, #FFEB3B, #4CAF50, #1565C0, #7B1FA2)" },
  { label: "Chiaro", hex: "#F5F5DC" },
];

export interface ProductAnalysis {
  recognition_confidence?: string;
  gender?: string;
  product_type: string;
  category: string;
  color: string;
  colors?: string[];
  brand: string | null;
  brand_confidence: string | null;
  style?: string;
  condition?: string;
  materials?: string | null;
  garment_features?: {
    logos?: Array<{ type: string; description: string; position: string; size: string }>;
    prints?: Array<{ type: string; description: string; position: string; technique: string }>;
    zippers?: string;
    pockets?: string;
    buttons?: string;
    hood?: string;
    collar?: string;
    cuffs?: string;
    hem?: string;
    embossing_relief?: string;
    patches_badges?: string;
    drawstrings?: string;
    stitching_details?: string;
    other_details?: string;
  };
  distinctive_details?: Record<string, string>;
  photos_assessment: Record<string, boolean>;
  missing_photos: MissingPhoto[];
  photo_quality?: Array<{
    photo_index: number;
    summary: string;
    scores?: {
      quality: number;
      light: number;
      background_contrast: number;
      completeness: number;
    };
    issues: Array<{
      type: string;
      severity: string;
      problem: string;
      suggestion: string;
      impact: string;
    }>;
  }>;
}

export interface MissingPhoto {
  type: string;
  name: string;
  reason: string;
  tips: string[];
}

interface StudioRecognitionProps {
  analysis: ProductAnalysis;
  previews: string[];
  onConfirm: (analysis: ProductAnalysis) => void;
  onBack: () => void;
}

type FieldKey = "color" | "brand";

const FIELD_LABELS: Record<FieldKey, string> = {
  color: "Colori dominanti",
  brand: "Brand",
};

const BRAND_OPTIONS = [
  { label: "Inserisci brand", value: "custom" },
  { label: "Nessun brand", value: "none" },
  { label: "Made in Italy", value: "made_in_italy" },
];

const StudioRecognition = ({ analysis, previews, onConfirm, onBack }: StudioRecognitionProps) => {
  const [editedAnalysis, setEditedAnalysis] = useState<ProductAnalysis>({ ...analysis });
  const [editingField, setEditingField] = useState<FieldKey | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showBrandPicker, setShowBrandPicker] = useState(false);
  const [customBrand, setCustomBrand] = useState("");
  const [lowConfidenceInput, setLowConfidenceInput] = useState("");
  const [lowConfidenceResolved, setLowConfidenceResolved] = useState(false);

  const isLowConfidence = editedAnalysis.recognition_confidence === "low" && !lowConfidenceResolved;

  const handleLowConfidenceSubmit = () => {
    if (!lowConfidenceInput.trim()) return;
    setEditedAnalysis(prev => ({
      ...prev,
      category: lowConfidenceInput.trim(),
      recognition_confidence: "high",
    }));
    setLowConfidenceResolved(true);
  };
  const needsBrandInput = !editedAnalysis.brand || editedAnalysis.brand_confidence !== "high";

  const handleEditStart = (field: FieldKey) => {
    setEditingField(field);
    setEditValue(editedAnalysis[field] || "");
  };

  const handleEditSave = () => {
    if (editingField) {
      setEditedAnalysis(prev => ({ ...prev, [editingField]: editValue || null }));
      setEditingField(null);
      setEditValue("");
    }
  };

  const handleBrandChoice = (choice: string) => {
    if (choice === "custom") {
      setShowBrandPicker(false);
      setEditingField("brand");
      setEditValue("");
      return;
    }
    const brandValue = choice === "none" ? null : choice === "made_in_italy" ? "Made in Italy" : choice;
    setEditedAnalysis(prev => ({ ...prev, brand: brandValue, brand_confidence: "high" }));
    setShowBrandPicker(false);
  };

  const fields: FieldKey[] = ["brand", "color"];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <Badge className="bg-green-500/10 text-green-500 border-green-500/30 mb-4">
          <Sparkles className="w-3 h-3 mr-1" />
          Riconoscimento completato
        </Badge>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Conferma i dettagli</h2>
        <p className="text-sm text-muted-foreground">
          Verifica le informazioni rilevate e modifica se necessario
        </p>
      </div>

      {/* Thumbnail strip */}
      {previews.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {previews.slice(0, 6).map((src, i) => (
            <img key={i} src={src} alt="" className="w-14 h-14 rounded-lg object-cover border border-border/50 shrink-0" />
          ))}
          {previews.length > 6 && (
            <div className="w-14 h-14 rounded-lg bg-muted/30 border border-border/50 flex items-center justify-center text-xs text-muted-foreground shrink-0">
              +{previews.length - 6}
            </div>
          )}
        </div>
      )}

      {/* Low confidence prompt */}
      {isLowConfidence && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-4 h-4 text-destructive" />
              <p className="text-sm font-semibold text-foreground">
                Non sono sicuro del tipo di indumento
              </p>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Le foto non mi permettono di identificare il capo con certezza. Che indumento è?
            </p>
            <div className="flex gap-2">
              <Input
                value={lowConfidenceInput}
                onChange={e => setLowConfidenceInput(e.target.value)}
                placeholder="Es: Felpa con cappuccio, Giacca bomber..."
                onKeyDown={e => e.key === "Enter" && handleLowConfidenceSubmit()}
                className="flex-1"
              />
              <Button size="sm" onClick={handleLowConfidenceSubmit} disabled={!lowConfidenceInput.trim()}>
                Conferma
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {needsBrandInput && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-3">
              Non vedo un brand chiaro. Vuoi inserirlo tu?
            </p>
            <div className="flex flex-wrap gap-2">
              {BRAND_OPTIONS.map(opt => (
                <Button
                  key={opt.value}
                  variant="glass"
                  size="sm"
                  onClick={() => handleBrandChoice(opt.value)}
                  className="text-xs"
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fields */}
      <Card className="border-border/50">
        <CardContent className="p-0 divide-y divide-border/30">
          {fields.map(field => {
            const value = field === "color" 
              ? (editedAnalysis.colors?.join(", ") || editedAnalysis.color || null)
              : editedAnalysis[field];
            const displayValue = value || "—";
            const isEmpty = !value;

            return (
              <div key={field} className="flex items-center justify-between px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{FIELD_LABELS[field]}</p>
                  <p className={`text-sm font-medium truncate ${isEmpty ? "text-muted-foreground/50 italic" : ""}`}>
                    {displayValue}
                  </p>
                </div>
                <button
                  onClick={() => field === "brand" && needsBrandInput ? setShowBrandPicker(true) : handleEditStart(field)}
                  className="ml-2 p-1.5 rounded-lg hover:bg-muted/50 transition-colors shrink-0"
                >
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Confirm */}
      <Button
        variant="neon"
        size="lg"
        className="w-full"
        onClick={() => onConfirm(editedAnalysis)}
      >
        <Check className="w-4 h-4 mr-2" />
        Conferma e continua
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>

      <Button variant="ghost" className="w-full text-muted-foreground" onClick={onBack}>
        ← Torna alle foto
      </Button>

      {/* Edit dialog */}
      <Dialog open={editingField !== null} onOpenChange={(open) => { if (!open) setEditingField(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifica {editingField ? FIELD_LABELS[editingField] : ""}</DialogTitle>
          </DialogHeader>
          <Input
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            placeholder={`Inserisci ${editingField ? FIELD_LABELS[editingField].toLowerCase() : ""}...`}
            autoFocus
            onKeyDown={e => e.key === "Enter" && handleEditSave()}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingField(null)}>Annulla</Button>
            <Button onClick={handleEditSave}>Salva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudioRecognition;
