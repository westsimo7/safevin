import { useState, useRef, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ImagePlus, X, ArrowRight, ArrowLeft, Camera, Sparkles, Check,
} from "lucide-react";

/* ── Vinted category tree & dynamic fields ── */

interface CategoryDef {
  label: string;
  children?: CategoryDef[];
  /** Extra fields required for this category */
  fields?: string[];
}

const VINTED_CATEGORIES: CategoryDef[] = [
  {
    label: "Abbigliamento donna",
    fields: ["taglia", "brand"],
    children: [
      { label: "Top e t-shirt", fields: ["taglia", "brand"] },
      { label: "Maglioni e felpe", fields: ["taglia", "brand"] },
      { label: "Camicie e bluse", fields: ["taglia", "brand"] },
      { label: "Vestiti", fields: ["taglia", "brand"] },
      { label: "Gonne", fields: ["taglia", "brand"] },
      { label: "Pantaloni e jeans", fields: ["taglia", "brand"] },
      { label: "Giacche e cappotti", fields: ["taglia", "brand"] },
      { label: "Tute e completi", fields: ["taglia", "brand"] },
      { label: "Costumi da bagno", fields: ["taglia", "brand"] },
      { label: "Intimo e pigiami", fields: ["taglia", "brand"] },
    ],
  },
  {
    label: "Abbigliamento uomo",
    fields: ["taglia", "brand"],
    children: [
      { label: "T-shirt e polo", fields: ["taglia", "brand"] },
      { label: "Maglioni e felpe", fields: ["taglia", "brand"] },
      { label: "Camicie", fields: ["taglia", "brand"] },
      { label: "Pantaloni e jeans", fields: ["taglia", "brand"] },
      { label: "Giacche e cappotti", fields: ["taglia", "brand"] },
      { label: "Completi e cravatte", fields: ["taglia", "brand"] },
      { label: "Costumi da bagno", fields: ["taglia", "brand"] },
    ],
  },
  {
    label: "Abbigliamento bambini",
    fields: ["taglia", "brand", "fascia_eta"],
  },
  {
    label: "Scarpe donna",
    fields: ["taglia_scarpe", "brand"],
    children: [
      { label: "Sneakers", fields: ["taglia_scarpe", "brand"] },
      { label: "Stivali", fields: ["taglia_scarpe", "brand"] },
      { label: "Sandali", fields: ["taglia_scarpe", "brand"] },
      { label: "Tacchi", fields: ["taglia_scarpe", "brand"] },
      { label: "Ballerine", fields: ["taglia_scarpe", "brand"] },
    ],
  },
  {
    label: "Scarpe uomo",
    fields: ["taglia_scarpe", "brand"],
    children: [
      { label: "Sneakers", fields: ["taglia_scarpe", "brand"] },
      { label: "Stivali", fields: ["taglia_scarpe", "brand"] },
      { label: "Scarpe eleganti", fields: ["taglia_scarpe", "brand"] },
      { label: "Sandali", fields: ["taglia_scarpe", "brand"] },
    ],
  },
  {
    label: "Borse e accessori",
    fields: ["brand"],
    children: [
      { label: "Borse a mano", fields: ["brand"] },
      { label: "Zaini", fields: ["brand"] },
      { label: "Portafogli", fields: ["brand"] },
      { label: "Cinture", fields: ["brand"] },
      { label: "Sciarpe e foulard", fields: ["brand"] },
      { label: "Occhiali", fields: ["brand"] },
      { label: "Orologi", fields: ["brand", "modello"] },
      { label: "Gioielli", fields: ["brand", "materiale"] },
    ],
  },
  {
    label: "Elettronica",
    fields: ["brand", "modello"],
    children: [
      { label: "Smartphone", fields: ["brand", "modello", "capacita"] },
      { label: "Tablet", fields: ["brand", "modello"] },
      { label: "Laptop e PC", fields: ["brand", "modello"] },
      { label: "Cuffie e audio", fields: ["brand", "modello"] },
      { label: "Fotocamere", fields: ["brand", "modello"] },
      { label: "Smartwatch", fields: ["brand", "modello"] },
      { label: "Accessori elettronica", fields: ["brand"] },
    ],
  },
  {
    label: "Videogiochi e console",
    fields: ["piattaforma"],
    children: [
      { label: "Console", fields: ["piattaforma", "brand", "modello"] },
      { label: "Videogiochi", fields: ["piattaforma", "classificazione_eta"] },
      { label: "Accessori gaming", fields: ["piattaforma", "brand"] },
    ],
  },
  {
    label: "Elettrodomestici",
    fields: ["brand", "modello"],
    children: [
      { label: "Piccoli elettrodomestici", fields: ["brand", "modello"] },
      { label: "Grandi elettrodomestici", fields: ["brand", "modello"] },
    ],
  },
  {
    label: "Casa e decorazioni",
    fields: [],
    children: [
      { label: "Tessili per la casa", fields: [] },
      { label: "Decorazioni", fields: [] },
      { label: "Illuminazione", fields: [] },
      { label: "Stoviglie e cucina", fields: ["brand"] },
    ],
  },
  {
    label: "Bellezza e cura",
    fields: ["brand"],
    children: [
      { label: "Make-up", fields: ["brand"] },
      { label: "Skincare", fields: ["brand"] },
      { label: "Profumi", fields: ["brand"] },
      { label: "Cura dei capelli", fields: ["brand"] },
    ],
  },
  {
    label: "Sport e tempo libero",
    fields: ["taglia", "brand"],
    children: [
      { label: "Abbigliamento sportivo", fields: ["taglia", "brand"] },
      { label: "Scarpe sportive", fields: ["taglia_scarpe", "brand"] },
      { label: "Attrezzatura sportiva", fields: ["brand"] },
      { label: "Biciclette", fields: ["brand", "modello"] },
    ],
  },
  {
    label: "Giocattoli e bambini",
    fields: ["fascia_eta"],
    children: [
      { label: "Giocattoli", fields: ["fascia_eta"] },
      { label: "Passeggini e seggiolini", fields: ["brand", "modello"] },
      { label: "Abbigliamento neonato", fields: ["taglia", "brand"] },
    ],
  },
  {
    label: "Libri e media",
    fields: [],
    children: [
      { label: "Libri", fields: ["autore", "genere_libro"] },
      { label: "CD e vinili", fields: ["artista"] },
      { label: "DVD e Blu-ray", fields: [] },
    ],
  },
  { label: "Animali", fields: [] },
  { label: "Altro", fields: [] },
];

/** Map of extra field keys → label + placeholder */
const FIELD_META: Record<string, { label: string; placeholder: string }> = {
  taglia: { label: "Taglia", placeholder: "Es: M, L, 42, S/M..." },
  taglia_scarpe: { label: "Taglia scarpe", placeholder: "Es: 38, 42, 44..." },
  brand: { label: "Brand / Marca", placeholder: "Es: Nike, Adidas, Samsung..." },
  modello: { label: "Modello", placeholder: "Es: iPhone 14, Galaxy S23..." },
  capacita: { label: "Capacità / Memoria", placeholder: "Es: 128GB, 256GB..." },
  piattaforma: { label: "Piattaforma", placeholder: "Es: PS5, Xbox, Nintendo Switch, PC..." },
  classificazione_eta: { label: "Classificazione per età", placeholder: "Es: PEGI 3, PEGI 12, PEGI 18..." },
  fascia_eta: { label: "Fascia d'età", placeholder: "Es: 0-3 mesi, 6-12 mesi, 3-5 anni..." },
  materiale: { label: "Materiale", placeholder: "Es: Oro, Argento, Acciaio..." },
  autore: { label: "Autore", placeholder: "Es: Stephen King, J.K. Rowling..." },
  genere_libro: { label: "Genere", placeholder: "Es: Romanzo, Fantasy, Manuale..." },
  artista: { label: "Artista", placeholder: "Es: Pink Floyd, Vasco Rossi..." },
};

/* ── Types ── */

interface ListingData {
  images: File[];
  titolo: string;
  descrizione: string;
  categoria: string;
  prezzo: string;
  brand: string;
  condizioni: string;
  taglia: string;
  colore: string;
  tempoCaricamento: string;
  origin: string;
  [key: string]: any;
}

interface AuditWizardProps {
  onSubmit: (data: ListingData) => void;
  isLoading: boolean;
}

const MAX_IMAGES = 15;

/* ── Steps builder ── */

type StepType =
  | "category"
  | "subcategory"
  | "images"
  | "titolo"
  | "descrizione"
  | "dynamic_field"
  | "prezzo"
  | "condizioni"
  | "colore"
  | "origin"
  | "tempo";

interface WizardStep {
  type: StepType;
  fieldKey?: string;
}

function buildSteps(cat: CategoryDef | null, subcat: CategoryDef | null): WizardStep[] {
  const steps: WizardStep[] = [{ type: "category" }];

  if (cat?.children && cat.children.length > 0) {
    steps.push({ type: "subcategory" });
  }

  steps.push({ type: "images" });
  steps.push({ type: "titolo" });
  steps.push({ type: "descrizione" });

  // Dynamic fields from the most specific category
  const fields = subcat?.fields ?? cat?.fields ?? [];
  for (const f of fields) {
    steps.push({ type: "dynamic_field", fieldKey: f });
  }

  steps.push({ type: "prezzo" });
  steps.push({ type: "condizioni" });
  steps.push({ type: "colore" });
  steps.push({ type: "origin" });

  return steps;
}

/* ── Component ── */

const AuditWizard = ({ onSubmit, isLoading }: AuditWizardProps) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [selectedCat, setSelectedCat] = useState<CategoryDef | null>(null);
  const [selectedSubcat, setSelectedSubcat] = useState<CategoryDef | null>(null);

  // Form data
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [titolo, setTitolo] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [prezzo, setPrezzo] = useState("");
  const [condizioni, setCondizioni] = useState("");
  const [colore, setColore] = useState("");
  const [tempoCaricamento, setTempoCaricamento] = useState("");
  const [origin, setOrigin] = useState<"online" | "test" | "">("");
  const [dynamicFields, setDynamicFields] = useState<Record<string, string>>({});

  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = useMemo(() => buildSteps(selectedCat, selectedSubcat), [selectedCat, selectedSubcat]);
  const currentStep = steps[currentStepIdx] || steps[0];

  // Ensure we don't go out of bounds after category change
  const safeStepIdx = Math.min(currentStepIdx, steps.length - 1);
  if (safeStepIdx !== currentStepIdx) {
    setCurrentStepIdx(safeStepIdx);
  }

  /* ── Image handling ── */
  const addImages = useCallback((files: FileList | File[]) => {
    const newFiles = Array.from(files).filter(f => f.type.startsWith("image/")).slice(0, MAX_IMAGES - images.length);
    if (newFiles.length === 0) return;
    setImages(prev => [...prev, ...newFiles]);
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => setPreviews(prev => [...prev, e.target?.result as string]);
      reader.readAsDataURL(file);
    });
  }, [images.length]);

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) addImages(e.dataTransfer.files);
  };

  /* ── Navigation ── */
  const canGoNext = (): boolean => {
    switch (currentStep.type) {
      case "category": return !!selectedCat;
      case "subcategory": return !!selectedSubcat;
      case "images": return true; // optional
      case "titolo": return !!titolo.trim();
      case "descrizione": return !!descrizione.trim();
      case "dynamic_field": return true; // optional
      case "prezzo": return true;
      case "condizioni": return true;
      case "colore": return true;
      case "origin": return !!origin;
      case "tempo": return true;
      default: return true;
    }
  };

  const isLastStep = (): boolean => {
    return actualStep.type === "origin" && !!origin;
  };

  const goNext = () => {
    if (!isLastStep()) {
      setCurrentStepIdx(prev => prev + 1);
    }
  };

  const goBack = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
    }
  };

  const handleCategorySelect = (cat: CategoryDef) => {
    setSelectedCat(cat);
    setSelectedSubcat(null);
    // If no children, skip subcategory step
    if (!cat.children || cat.children.length === 0) {
      setCurrentStepIdx(1); // Go to images (index 1 since no subcategory step)
    } else {
      setCurrentStepIdx(1); // Go to subcategory
    }
  };

  const handleSubcategorySelect = (sub: CategoryDef) => {
    setSelectedSubcat(sub);
    setCurrentStepIdx(2); // Go to images
  };

  const handleSubmitForm = () => {
    const catLabel = selectedSubcat
      ? `${selectedCat?.label} > ${selectedSubcat.label}`
      : selectedCat?.label || "";

    onSubmit({
      images,
      titolo,
      descrizione,
      categoria: catLabel,
      prezzo,
      brand: dynamicFields.brand || "",
      condizioni,
      taglia: dynamicFields.taglia || dynamicFields.taglia_scarpe || "",
      colore,
      tempoCaricamento: origin === "online" ? tempoCaricamento : "",
      origin: origin === "online" ? "external" : "external",
      ...dynamicFields,
    });
  };

  const actualStep: WizardStep = steps[currentStepIdx] || steps[steps.length - 1];

  const totalVisualSteps = steps.length;
  const currentVisualStep = Math.min(currentStepIdx + 1, totalVisualSteps);

  /* ── Progress bar ── */
  const progress = totalVisualSteps > 0 ? (currentVisualStep / totalVisualSteps) * 100 : 0;

  const isLast = actualStep.type === "tempo" || (actualStep.type === "origin" && origin === "test");

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground font-medium tabular-nums">
          {currentVisualStep}/{totalVisualSteps}
        </span>
      </div>

      <Card className="border-border/50 overflow-hidden">
        <CardContent className="pt-8 pb-6 px-6 min-h-[320px] flex flex-col">
          {/* ── Category selection ── */}
          {actualStep.type === "category" && (
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Cosa stai vendendo?</h2>
                <p className="text-sm text-muted-foreground mt-1">Seleziona la categoria del tuo articolo</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-1">
                {VINTED_CATEGORIES.map(cat => (
                  <button
                    key={cat.label}
                    onClick={() => handleCategorySelect(cat)}
                    className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                      selectedCat?.label === cat.label
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 bg-card hover:border-primary/40 hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Subcategory selection ── */}
          {actualStep.type === "subcategory" && selectedCat?.children && (
            <div className="flex-1 space-y-4">
              <div>
                <Badge variant="outline" className="mb-2 text-xs">{selectedCat.label}</Badge>
                <h2 className="text-xl font-bold text-foreground">Specifica il tipo</h2>
                <p className="text-sm text-muted-foreground mt-1">Seleziona la sottocategoria più adatta</p>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-[350px] overflow-y-auto pr-1">
                {selectedCat.children.map(sub => (
                  <button
                    key={sub.label}
                    onClick={() => handleSubcategorySelect(sub)}
                    className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                      selectedSubcat?.label === sub.label
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 bg-card hover:border-primary/40 hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Images ── */}
          {actualStep.type === "images" && (
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Foto dell'annuncio</h2>
                <p className="text-sm text-muted-foreground mt-1">Carica le foto del tuo articolo (facoltativo)</p>
              </div>
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                  dragActive ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/40 hover:bg-muted/30"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={e => e.target.files && addImages(e.target.files)} />
                <Camera className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Trascina le foto qui o <span className="text-primary font-medium">carica dal dispositivo</span>
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">Max {MAX_IMAGES} immagini</p>
              </div>
              {previews.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {previews.map((src, i) => (
                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-border/50">
                      <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); removeImage(i); }}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Title ── */}
          {actualStep.type === "titolo" && (
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Titolo dell'annuncio</h2>
                <p className="text-sm text-muted-foreground mt-1">Inserisci il titolo esatto del tuo annuncio</p>
              </div>
              <Input
                value={titolo}
                onChange={e => setTitolo(e.target.value)}
                placeholder="Es: Nike Air Force 1 Bianche 42 Nuove"
                className="bg-background border-border text-base h-12"
                autoFocus
              />
            </div>
          )}

          {/* ── Description ── */}
          {actualStep.type === "descrizione" && (
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Descrizione</h2>
                <p className="text-sm text-muted-foreground mt-1">Incolla la descrizione completa del tuo annuncio</p>
              </div>
              <Textarea
                value={descrizione}
                onChange={e => setDescrizione(e.target.value)}
                placeholder="Incolla qui la descrizione completa..."
                className="bg-background border-border min-h-[160px]"
                autoFocus
              />
            </div>
          )}

          {/* ── Dynamic field ── */}
          {actualStep.type === "dynamic_field" && actualStep.fieldKey && (
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {FIELD_META[actualStep.fieldKey]?.label || actualStep.fieldKey}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Questo campo è specifico per la categoria selezionata
                </p>
              </div>
              <Input
                value={dynamicFields[actualStep.fieldKey] || ""}
                onChange={e => setDynamicFields(prev => ({ ...prev, [actualStep.fieldKey!]: e.target.value }))}
                placeholder={FIELD_META[actualStep.fieldKey]?.placeholder || "Inserisci..."}
                className="bg-background border-border text-base h-12"
                autoFocus
              />
            </div>
          )}

          {/* ── Price ── */}
          {actualStep.type === "prezzo" && (
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Prezzo</h2>
                <p className="text-sm text-muted-foreground mt-1">A quanto lo stai vendendo?</p>
              </div>
              <div className="relative">
                <Input
                  value={prezzo}
                  onChange={e => setPrezzo(e.target.value)}
                  placeholder="Es: 25.00"
                  type="number"
                  step="0.01"
                  className="bg-background border-border text-base h-12 pl-8"
                  autoFocus
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">€</span>
              </div>
            </div>
          )}

          {/* ── Conditions ── */}
          {actualStep.type === "condizioni" && (
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Condizioni</h2>
                <p className="text-sm text-muted-foreground mt-1">In che stato si trova l'articolo?</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {["Nuovo con etichetta", "Nuovo senza etichetta", "Ottime condizioni", "Buone condizioni", "Discrete condizioni"].map(c => (
                  <button
                    key={c}
                    onClick={() => setCondizioni(c)}
                    className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                      condizioni === c
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 bg-card hover:border-primary/40 hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Color ── */}
          {actualStep.type === "colore" && (
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Colore principale</h2>
                <p className="text-sm text-muted-foreground mt-1">Qual è il colore principale dell'articolo?</p>
              </div>
              <Input
                value={colore}
                onChange={e => setColore(e.target.value)}
                placeholder="Es: Bianco, Nero, Multicolor..."
                className="bg-background border-border text-base h-12"
                autoFocus
              />
            </div>
          )}

          {/* ── Origin (online vs test) ── */}
          {actualStep.type === "origin" && (
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Tipo di annuncio</h2>
                <p className="text-sm text-muted-foreground mt-1">Questo annuncio è già online o vuoi analizzarlo prima di pubblicarlo?</p>
              </div>
              <div className="grid gap-3">
                <button
                  onClick={() => setOrigin("online")}
                  className={`text-left px-5 py-4 rounded-xl border transition-all duration-200 ${
                    origin === "online"
                      ? "border-primary bg-primary/10"
                      : "border-border/50 bg-card hover:border-primary/40 hover:bg-muted/50"
                  }`}
                >
                  <p className={`font-semibold text-sm ${origin === "online" ? "text-primary" : "text-foreground"}`}>
                    📱 È già online su Vinted
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Lo analizzeremo considerando il tempo di esposizione
                  </p>
                </button>
                <button
                  onClick={() => { setOrigin("test"); setTempoCaricamento(""); }}
                  className={`text-left px-5 py-4 rounded-xl border transition-all duration-200 ${
                    origin === "test"
                      ? "border-primary bg-primary/10"
                      : "border-border/50 bg-card hover:border-primary/40 hover:bg-muted/50"
                  }`}
                >
                  <p className={`font-semibold text-sm ${origin === "test" ? "text-primary" : "text-foreground"}`}>
                    🧪 Voglio analizzarlo prima di pubblicare
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ottimizzalo prima di metterlo online
                  </p>
                </button>
              </div>

              {/* Inline tempo field when online is selected */}
              {origin === "online" && (
                <div className="space-y-2 animate-fade-in pt-2">
                  <h3 className="text-sm font-semibold text-foreground">Da quanto è online?</h3>
                  <Input
                    value={tempoCaricamento}
                    onChange={e => setTempoCaricamento(e.target.value)}
                    placeholder="Es: 3 giorni, 2 settimane, 1 mese..."
                    className="bg-background border-border text-base h-12"
                    autoFocus
                  />
                </div>
              )}
            </div>
          )}

          {/* ── Navigation ── */}
          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border/30">
            {currentStepIdx > 0 && (
              <Button variant="ghost" onClick={goBack} className="gap-1">
                <ArrowLeft className="w-4 h-4" />
                Indietro
              </Button>
            )}
            <div className="flex-1" />

            {actualStep.type !== "category" && actualStep.type !== "subcategory" && (
              isLast ? (
                <Button
                  variant="neon"
                  size="lg"
                  onClick={handleSubmitForm}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Avvia Audit
                </Button>
              ) : (
                <Button
                  onClick={goNext}
                  disabled={!canGoNext()}
                  className="gap-1"
                >
                  Avanti
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditWizard;
