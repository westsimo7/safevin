import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ImagePlus, X, Camera, Tag, DollarSign, Shirt, Palette, Clock, FileText, Layers, Sparkles } from "lucide-react";
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
}
interface ListingInputFormProps {
  onSubmit: (data: ListingData) => void;
  isLoading: boolean;
}
const MAX_IMAGES = 50;
const ListingInputForm = ({
  onSubmit,
  isLoading
}: ListingInputFormProps) => {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [titolo, setTitolo] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [categoria, setCategoria] = useState("");
  const [prezzo, setPrezzo] = useState("");
  const [brand, setBrand] = useState("");
  const [condizioni, setCondizioni] = useState("");
  const [taglia, setTaglia] = useState("");
  const [colore, setColore] = useState("");
  const [tempoCaricamento, setTempoCaricamento] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addImages = useCallback((files: FileList | File[]) => {
    const newFiles = Array.from(files).filter(f => f.type.startsWith("image/")).slice(0, MAX_IMAGES - images.length);
    if (newFiles.length === 0) return;
    setImages(prev => [...prev, ...newFiles]);
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        setPreviews(prev => [...prev, e.target?.result as string]);
      };
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
  const handleSubmit = () => {
    onSubmit({
      images,
      titolo,
      descrizione,
      categoria,
      prezzo,
      brand,
      condizioni,
      taglia,
      colore,
      tempoCaricamento
    });
  };
  const hasMinData = titolo.trim() || descrizione.trim() || images.length > 0;
  return <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Inserisci i dati del tuo annuncio
        </CardTitle>
        <p className="text-sm text-muted-foreground">Sii il più preciso possibile per un analisi specifica e dettagliata</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Image Upload Area */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" />
            Foto annuncio
            <Badge variant="outline" className="text-xs ml-auto">
              {images.length}/{MAX_IMAGES}
            </Badge>
          </label>
          
          <div className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer ${dragActive ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/40 hover:bg-muted/30"}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
            <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={e => e.target.files && addImages(e.target.files)} />
            <ImagePlus className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Trascina le foto qui o <span className="text-primary font-medium">sfoglia</span>
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Max {MAX_IMAGES} immagini • Max 50MB per immagine
            </p>
          </div>

          {/* Image Previews */}
          {previews.length > 0 && <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mt-3">
              {previews.map((src, i) => <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-border/50">
                  <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={e => {
              e.stopPropagation();
              removeImage(i);
            }} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-center text-white py-0.5">
                    {i + 1}
                  </div>
                </div>)}
            </div>}
        </div>

        {/* Listing Data Fields */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Titolo */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-primary" />
              Titolo *
            </label>
            <Input value={titolo} onChange={e => setTitolo(e.target.value)} placeholder="Es: Nike Air Force 1 Bianche 42 Nuove" className="bg-background border-border" />
          </div>

          {/* Descrizione */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-primary" />
              Descrizione *
            </label>
            <Textarea value={descrizione} onChange={e => setDescrizione(e.target.value)} placeholder="Inserisci la descrizione completa del tuo annuncio..." className="bg-background border-border min-h-[120px]" />
          </div>

          {/* Categoria */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-primary" />
              Categoria
            </label>
            <Input value={categoria} onChange={e => setCategoria(e.target.value)} placeholder="Es: Scarpe, Felpe, Pantaloni..." className="bg-background border-border" />
          </div>

          {/* Prezzo */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5 text-primary" />
              Prezzo (€)
            </label>
            <Input value={prezzo} onChange={e => setPrezzo(e.target.value)} placeholder="Es: 25.00" type="number" step="0.01" className="bg-background border-border" />
          </div>

          {/* Brand */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-primary" />
              Brand
            </label>
            <Input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Es: Nike, Adidas, Zara..." className="bg-background border-border" />
          </div>

          {/* Condizioni */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Condizioni
            </label>
            <Input value={condizioni} onChange={e => setCondizioni(e.target.value)} placeholder="Es: Nuovo con etichetta, Usato poco..." className="bg-background border-border" />
          </div>

          {/* Taglia */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
              <Shirt className="w-3.5 h-3.5 text-primary" />
              Taglia
            </label>
            <Input value={taglia} onChange={e => setTaglia(e.target.value)} placeholder="Es: M, 42, S/M..." className="bg-background border-border" />
          </div>

          {/* Colore */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-primary" />
              Colore
            </label>
            <Input value={colore} onChange={e => setColore(e.target.value)} placeholder="Es: Bianco, Nero, Multicolor..." className="bg-background border-border" />
          </div>

          {/* Tempo da caricamento */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-primary" />
              Da quanto è online
            </label>
            <Input value={tempoCaricamento} onChange={e => setTempoCaricamento(e.target.value)} placeholder="Es: 3 giorni, 2 settimane, 1 mese..." className="bg-background border-border" />
          </div>
        </div>

        {/* Submit */}
        <Button variant="neon" size="lg" className="w-full" onClick={handleSubmit} disabled={isLoading || !hasMinData}>
          <Sparkles className="w-4 h-4 mr-2" />
          Avvia Analisi Completa
        </Button>
      </CardContent>
    </Card>;
};
export default ListingInputForm;