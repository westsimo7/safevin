import { useState, useRef, useCallback } from "react";
import { Camera, ImagePlus, X, Loader2, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import StudioPhotoGuide from "./StudioPhotoGuide";

const MAX_IMAGES = 15;
const MAX_SIZE_MB = 25;

interface StudioUploadProps {
  onAnalyze: (images: File[], previews: string[]) => void;
  isLoading: boolean;
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 1400;
        let w = img.width, h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
          else { w = Math.round(w * maxDim / h); h = maxDim; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const StudioUpload = ({ onAnalyze, isLoading }: StudioUploadProps) => {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addImages = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => {
      if (!f.type.startsWith("image/")) return false;
      if (f.size > MAX_SIZE_MB * 1024 * 1024) return false;
      return true;
    }).slice(0, MAX_IMAGES - images.length);
    if (arr.length === 0) return;
    setImages(prev => [...prev, ...arr]);
    arr.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => setPreviews(prev => [...prev, e.target?.result as string]);
      reader.readAsDataURL(file);
    });
  }, [images.length]);

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    onAnalyze(images, previews);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
          <Camera className="w-3 h-3 mr-1" />
          Fase 1 di 2
        </Badge>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Carica le foto del prodotto</h1>
        <p className="text-sm text-muted-foreground">
          Il sistema analizzerà automaticamente le immagini per capire cosa stai vendendo
        </p>
      </div>

      <StudioPhotoGuide />

      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary" />
              Foto prodotto
            </label>
            <Badge variant="outline" className="text-xs">{images.length}/{MAX_IMAGES}</Badge>
          </div>

          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              dragActive ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/40"
            }`}
            onDragEnter={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files) addImages(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={e => e.target.files && addImages(e.target.files)} />
            <ImagePlus className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Trascina le foto qui o <span className="text-primary font-medium">carica</span>
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">Max 15 foto • Max 25MB per foto</p>
          </div>

          {previews.length > 0 && (
            <div className="grid grid-cols-5 sm:grid-cols-8 gap-2 mt-4">
              {previews.map((src, i) => (
                <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-border/50 cursor-pointer" onClick={() => setLightboxIndex(i)}>
                  <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={e => { e.stopPropagation(); removeImage(i); }}
                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-center text-white py-0.5">{i + 1}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        variant="neon"
        size="lg"
        className="w-full"
        onClick={handleSubmit}
        disabled={images.length === 0 || isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4 mr-2" />
        )}
        {isLoading ? "Analisi in corso..." : "Analizza immagini"}
      </Button>

      {/* Lightbox */}
      <Dialog open={lightboxIndex !== null} onOpenChange={() => setLightboxIndex(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl p-2 sm:p-4 bg-background/95 backdrop-blur-sm border-border/50">
          {lightboxIndex !== null && (
            <div className="relative flex items-center justify-center">
              {previews.length > 1 && (
                <button
                  onClick={() => setLightboxIndex((lightboxIndex - 1 + previews.length) % previews.length)}
                  className="absolute left-1 z-10 w-9 h-9 rounded-full bg-muted/70 hover:bg-muted flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
              )}
              <img
                src={previews[lightboxIndex]}
                alt={`Foto ${lightboxIndex + 1}`}
                className="max-h-[70vh] w-auto mx-auto rounded-lg object-contain"
              />
              {previews.length > 1 && (
                <button
                  onClick={() => setLightboxIndex((lightboxIndex + 1) % previews.length)}
                  className="absolute right-1 z-10 w-9 h-9 rounded-full bg-muted/70 hover:bg-muted flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-foreground" />
                </button>
              )}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-background/80 px-3 py-1 rounded-full">
                {lightboxIndex + 1} / {previews.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { compressImage };
export default StudioUpload;
