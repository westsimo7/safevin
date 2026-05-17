import { useState, useRef, useCallback, TouchEvent as ReactTouchEvent } from "react";
import { Camera, ImagePlus, X, Loader2, Sparkles, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import StudioPhotoGuide from "./StudioPhotoGuide";
import { ensureBrowserCompatibleImages } from "@/lib/heicConvert";

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
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const touchStartX = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addImages = useCallback(async (files: FileList | File[]) => {
    const raw = Array.from(files).slice(0, MAX_IMAGES - images.length);
    if (raw.length === 0) return;
    const converted = await ensureBrowserCompatibleImages(raw);
    const arr = converted.filter(f => {
      if (!f.type.startsWith("image/")) return false;
      if (f.size > MAX_SIZE_MB * 1024 * 1024) return false;
      return true;
    });
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
    <div className="flex flex-col h-full animate-fade-in overflow-hidden">
      <div className="text-center shrink-0 mb-2">
        <Badge className="bg-primary/10 text-primary border-primary/20 mb-2">
          <Camera className="w-3 h-3 mr-1" />
          Fase 1 di 3
        </Badge>
        <PageTitle
          title="Carica le foto del prodotto"
          subtitle="Il sistema raccoglie tutti i dettagli fondamentali per un annuncio ottimizzato"
          className="text-center"
        />
      </div>

      <div className="shrink-0 mb-2 sm:flex-[2]">
        <StudioPhotoGuide />
      </div>

      <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={e => e.target.files && addImages(e.target.files)} />
      <Card className="border-border/50 flex-1 min-h-0 mb-2 hidden sm:block">
        <CardContent className="p-3 h-full flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary" />
              Foto prodotto
            </label>
            <Badge variant="outline" className="text-xs">{images.length}/{MAX_IMAGES}</Badge>
          </div>

          <div
            className={`relative border-2 border-dashed rounded-xl p-3 text-center transition-all ${
              dragActive ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/40"
            } ${previews.length > 0 ? "" : "flex-1 cursor-pointer"}`}
            onDragEnter={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files) addImages(e.dataTransfer.files); }}
            onClick={previews.length === 0 ? () => fileInputRef.current?.click() : undefined}
          >
            
            <ImagePlus className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">
              {previews.length > 0 ? (
                <span className="text-primary font-medium cursor-pointer" onClick={() => fileInputRef.current?.click()}>Aggiungi altre foto</span>
              ) : (
                <>Trascina le foto qui o <span className="text-primary font-medium">carica</span></>
              )}
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">{images.length} foto caricate • Max {MAX_IMAGES}</p>
            
            {previews.length > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setGalleryIndex(0); setGalleryOpen(true); }}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                Vedi foto ({previews.length})
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mobile: CTA buttons */}
      <div className="flex flex-row gap-2 mb-2 sm:hidden shrink-0">
        <Button
          variant="outline"
          className={`border-primary/30 text-primary ${previews.length > 0 ? "flex-1 min-w-0 px-2" : "w-full"}`}
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="w-4 h-4 mr-1.5 shrink-0" />
          <span className="truncate">Carica foto</span>
          {images.length > 0 && <Badge variant="outline" className="ml-1.5 text-[10px] shrink-0">{images.length}</Badge>}
        </Button>

        {previews.length > 0 && (
          <Button
            variant="outline"
            className="flex-1 min-w-0 px-2 border-border/50"
            onClick={() => { setGalleryIndex(0); setGalleryOpen(true); }}
          >
            <Eye className="w-4 h-4 mr-1.5 shrink-0" />
            <span className="truncate">Allegate ({previews.length})</span>
          </Button>
        )}
      </div>

      <Button
        variant="neon"
        size="lg"
        className="w-full shrink-0"
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

      {/* Gallery popup */}
      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl p-3 sm:p-5 bg-background/95 backdrop-blur-sm border-border/50 rounded-2xl">
          {previews.length > 0 && (
            <div
              className="relative flex items-center justify-center select-none"
              onTouchStart={(e: ReactTouchEvent) => { touchStartX.current = e.touches[0].clientX; }}
              onTouchEnd={(e: ReactTouchEvent) => {
                const diff = touchStartX.current - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 50) {
                  if (diff > 0) setGalleryIndex(prev => Math.min(prev + 1, previews.length - 1));
                  else setGalleryIndex(prev => Math.max(prev - 1, 0));
                }
              }}
            >
              {previews.length > 1 && (
                <button
                  onClick={() => setGalleryIndex(prev => (prev - 1 + previews.length) % previews.length)}
                  className="absolute left-1 z-10 w-9 h-9 rounded-full bg-muted/70 hover:bg-muted items-center justify-center transition-colors hidden sm:flex"
                >
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
              )}
              <img
                src={previews[galleryIndex]}
                alt={`Foto ${galleryIndex + 1}`}
                className="max-h-[60vh] w-auto mx-auto rounded-xl object-contain"
              />
              {previews.length > 1 && (
                <button
                  onClick={() => setGalleryIndex(prev => (prev + 1) % previews.length)}
                  className="absolute right-1 z-10 w-9 h-9 rounded-full bg-muted/70 hover:bg-muted items-center justify-center transition-colors hidden sm:flex"
                >
                  <ChevronRight className="w-5 h-5 text-foreground" />
                </button>
              )}
            </div>
          )}
          {previews.length > 0 && (
            <div className="flex items-center justify-between mt-3">
              <div className="text-xs text-muted-foreground">
                {galleryIndex + 1} / {previews.length}
              </div>
              <button
                onClick={() => {
                  removeImage(galleryIndex);
                  if (previews.length <= 1) {
                    setGalleryOpen(false);
                  } else if (galleryIndex >= previews.length - 1) {
                    setGalleryIndex(prev => Math.max(0, prev - 1));
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-medium transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Elimina foto
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { compressImage };
export default StudioUpload;
