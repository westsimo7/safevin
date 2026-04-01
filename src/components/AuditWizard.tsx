import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ImagePlus, X, Camera, ArrowRight, ArrowLeft, Check,
  FileText, Layers, Tag, DollarSign, Sparkles, Clock, Globe, FlaskConical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface AuditData {
  images: File[];
  imagePreviews: string[];
  titolo: string;
  descrizione: string;
  categoria: string;
  brand: string;
  prezzo: string;
  condizioni: string;
  isPubblicato: boolean | null;
  tempoOnline: string;
}

interface AuditWizardProps {
  onComplete: (data: AuditData) => void;
}

const MAX_IMAGES = 15;
const MAX_MB = 20;

type Step = "photos" | "titolo" | "descrizione" | "categoria" | "brand" | "prezzo" | "condizioni" | "pubblicato" | "tempo";

const STEPS: Step[] = ["photos", "titolo", "descrizione", "categoria", "brand", "prezzo", "condizioni", "pubblicato"];

const AuditWizard = ({ onComplete }: AuditWizardProps) => {
  const [step, setStep] = useState<Step>("photos");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [titolo, setTitolo] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [categoria, setCategoria] = useState("");
  const [brand, setBrand] = useState("");
  const [prezzo, setPrezzo] = useState("");
  const [condizioni, setCondizioni] = useState("");
  const [isPubblicato, setIsPubblicato] = useState<boolean | null>(null);
  const [tempoOnline, setTempoOnline] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allSteps = isPubblicato === true ? [...STEPS, "tempo" as Step] : STEPS;
  const currentIndex = allSteps.indexOf(step);
  const progress = ((currentIndex + 1) / allSteps.length) * 100;

  const addImages = useCallback((files: FileList | File[]) => {
    const valid = Array.from(files)
      .filter(f => f.type.startsWith("image/") && f.size <= MAX_MB * 1024 * 1024)
      .slice(0, MAX_IMAGES - images.length);
    if (!valid.length) return;
    setImages(prev => [...prev, ...valid]);
    valid.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => setPreviews(prev => [...prev, e.target?.result as string]);
      reader.readAsDataURL(file);
    });
  }, [images.length]);

  const removeImage = (i: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
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

  const goNext = () => {
    const idx = allSteps.indexOf(step);
    if (step === "pubblicato" && isPubblicato === true) {
      setStep("tempo");
    } else if (idx < allSteps.length - 1) {
      setStep(allSteps[idx + 1]);
    } else {
      handleSubmit();
    }
  };

  const goBack = () => {
    const idx = allSteps.indexOf(step);
    if (idx > 0) setStep(allSteps[idx - 1]);
  };

  const handleSubmit = () => {
    onComplete({
      images,
      imagePreviews: previews,
      titolo,
      descrizione,
      categoria,
      brand,
      prezzo,
      condizioni,
      isPubblicato,
      tempoOnline,
    });
  };

  const canProceed = (): boolean => {
    switch (step) {
      case "photos": return images.length > 0;
      case "titolo": return titolo.trim().length > 0;
      case "descrizione": return descrizione.trim().length > 0;
      case "categoria": return categoria.trim().length > 0;
      case "brand": return true; // optional
      case "prezzo": return prezzo.trim().length > 0;
      case "condizioni": return condizioni.trim().length > 0;
      case "pubblicato": return isPubblicato !== null;
      case "tempo": return tempoOnline.trim().length > 0;
      default: return false;
    }
  };

  const isLastStep = step === "pubblicato" && isPubblicato === false
    || step === "tempo"
    || (step === allSteps[allSteps.length - 1] && !(step === "pubblicato" && isPubblicato === true));

  const slideVariants = {
    enter: { opacity: 0, x: 40, filter: "blur(4px)" },
    center: { opacity: 1, x: 0, filter: "blur(0px)" },
    exit: { opacity: 0, x: -40, filter: "blur(4px)" },
  };

  const renderStep = () => {
    switch (step) {
      case "photos":
        return (
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2">
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Foto dell'annuncio
              </h2>
              <p className="text-[13px] sm:text-sm text-muted-foreground">
                Carica le foto esattamente come le hai nell'annuncio
              </p>
            </div>

            <div
              className={`border-2 border-dashed rounded-xl p-5 sm:p-8 text-center transition-all cursor-pointer ${
                dragActive ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/40"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={e => e.target.files && addImages(e.target.files)}
              />
              <ImagePlus className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground mx-auto mb-2 sm:mb-3" />
              <p className="text-[13px] sm:text-sm text-muted-foreground">
                Trascina qui o <span className="text-primary font-medium">seleziona</span>
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground/60 mt-1">
                Max {MAX_IMAGES} foto · Max {MAX_MB}MB per foto
              </p>
            </div>

            {images.length === 0 && (
              <button
                type="button"
                onClick={goNext}
                className="text-[13px] sm:text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors w-full text-center pt-1"
              >
                Procedi senza foto →
              </button>
            )}

            {previews.length > 0 && (
              <div className="space-y-2">
                <Badge variant="outline" className="text-[11px] sm:text-xs">{images.length}/{MAX_IMAGES} foto</Badge>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-1.5 sm:gap-2">
                  {previews.map((src, i) => (
                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-border/50">
                      <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); removeImage(i); }}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 active:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-center text-white py-0.5">
                        {i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case "titolo":
        return (
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Titolo dell'annuncio
              </h2>
              <p className="text-[13px] sm:text-sm text-muted-foreground">Copia e incolla il titolo esatto del tuo annuncio</p>
            </div>
            <Input
              value={titolo}
              onChange={e => setTitolo(e.target.value)}
              placeholder="Es: Nike Air Force 1 Bianche 42 Nuove"
              className="text-base h-11 sm:h-10"
              autoFocus
            />
          </div>
        );

      case "descrizione":
        return (
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Descrizione
              </h2>
              <p className="text-[13px] sm:text-sm text-muted-foreground">Incolla la descrizione completa del tuo annuncio</p>
            </div>
            <Textarea
              value={descrizione}
              onChange={e => setDescrizione(e.target.value)}
              placeholder="Incolla qui la descrizione..."
              className="min-h-[140px] sm:min-h-[160px] text-base"
              autoFocus
            />
          </div>
        );

      case "categoria":
        return (
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Categoria
              </h2>
              <p className="text-[13px] sm:text-sm text-muted-foreground">In che categoria hai inserito l'annuncio?</p>
            </div>
            <Input
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              placeholder="Es: Scarpe, Felpe, Elettronica..."
              className="text-base h-11 sm:h-10"
              autoFocus
            />
          </div>
        );

      case "brand":
        return (
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2">
                <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Brand
              </h2>
              <p className="text-[13px] sm:text-sm text-muted-foreground">Quale marca hai indicato? (opzionale)</p>
            </div>
            <Input
              value={brand}
              onChange={e => setBrand(e.target.value)}
              placeholder="Es: Nike, Adidas, Zara..."
              className="text-base h-11 sm:h-10"
              autoFocus
            />
          </div>
        );

      case "prezzo":
        return (
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Prezzo
              </h2>
              <p className="text-[13px] sm:text-sm text-muted-foreground">A quanto lo stai vendendo?</p>
            </div>
            <div className="relative">
              <Input
                value={prezzo}
                onChange={e => setPrezzo(e.target.value)}
                placeholder="Es: 25.00"
                type="number"
                step="0.01"
                className="text-base pl-8 h-11 sm:h-10"
                autoFocus
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">€</span>
            </div>
          </div>
        );

      case "condizioni":
        return (
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Condizioni
              </h2>
              <p className="text-[13px] sm:text-sm text-muted-foreground">In che stato è l'articolo?</p>
            </div>
            <Input
              value={condizioni}
              onChange={e => setCondizioni(e.target.value)}
              placeholder="Es: Nuovo con etichetta, Usato poco, Buone condizioni..."
              className="text-base h-11 sm:h-10"
              autoFocus
            />
          </div>
        );

      case "pubblicato":
        return (
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Stato dell'annuncio
              </h2>
              <p className="text-[13px] sm:text-sm text-muted-foreground">Questo annuncio è già online o è un test?</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <Card
                className={`cursor-pointer transition-all hover:border-primary/50 ${
                  isPubblicato === true ? "border-primary shadow-[0_0_15px_hsl(var(--primary)/0.2)]" : "border-border/50"
                }`}
                onClick={() => setIsPubblicato(true)}
              >
                <CardContent className="p-3.5 sm:p-5 text-center space-y-1.5 sm:space-y-2">
                  <Globe className="w-7 h-7 sm:w-8 sm:h-8 mx-auto text-primary" />
                  <p className="font-semibold text-[13px] sm:text-sm">Già pubblicato</p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">È già online su una piattaforma</p>
                </CardContent>
              </Card>
              <Card
                className={`cursor-pointer transition-all hover:border-primary/50 ${
                  isPubblicato === false ? "border-primary shadow-[0_0_15px_hsl(var(--primary)/0.2)]" : "border-border/50"
                }`}
                onClick={() => setIsPubblicato(false)}
              >
                <CardContent className="p-3.5 sm:p-5 text-center space-y-1.5 sm:space-y-2">
                  <FlaskConical className="w-7 h-7 sm:w-8 sm:h-8 mx-auto text-primary" />
                  <p className="font-semibold text-[13px] sm:text-sm">Test / Bozza</p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">Non è ancora pubblicato</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "tempo":
        return (
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Da quanto è online?
              </h2>
              <p className="text-[13px] sm:text-sm text-muted-foreground">Indica da quanto tempo è pubblicato l'annuncio</p>
            </div>
            <Input
              value={tempoOnline}
              onChange={e => setTempoOnline(e.target.value)}
              placeholder="Es: 3 giorni, 2 settimane, 1 mese..."
              className="text-base h-11 sm:h-10"
              autoFocus
            />
          </div>
        );
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 sm:space-y-6">
      {/* Progress bar */}
      <div className="space-y-1.5 sm:space-y-2">
        <div className="h-1 sm:h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        <p className="text-[11px] sm:text-xs text-muted-foreground text-right">
          {currentIndex + 1} di {allSteps.length}
        </p>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-2.5 sm:gap-3 pt-2">
        {currentIndex > 0 && (
          <Button variant="outline" onClick={goBack} className="flex-1 h-11 sm:h-10">
            <ArrowLeft className="w-4 h-4 mr-1.5 sm:mr-2" />
            Indietro
          </Button>
        )}
        <Button
          variant="neon"
          onClick={goNext}
          disabled={!canProceed()}
          className="flex-1 h-11 sm:h-10"
        >
          {isLastStep ? (
            <>
              <Check className="w-4 h-4 mr-1.5 sm:mr-2" />
              Avvia Audit
            </>
          ) : (
            <>
              Continua
              <ArrowRight className="w-4 h-4 ml-1.5 sm:ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AuditWizard;
