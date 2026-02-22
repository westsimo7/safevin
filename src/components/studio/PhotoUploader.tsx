import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, X, Star, ArrowRight, ImagePlus } from "lucide-react";

interface PhotoUploaderProps {
  categoria: string;
  onComplete: (files: File[]) => void;
}

const PhotoUploader = ({ categoria, onComplete }: PhotoUploaderProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [mainIndex, setMainIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const arr = Array.from(newFiles);
    const allFiles = [...files, ...arr].slice(0, 10);
    setFiles(allFiles);

    // Generate previews
    arr.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviews((prev) => [...prev, reader.result as string].slice(0, 10));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    if (mainIndex === index) setMainIndex(0);
    else if (mainIndex > index) setMainIndex(mainIndex - 1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          Carica le foto del prodotto
        </h2>
        <p className="text-muted-foreground">
          L'AI analizzerà ogni dettaglio per costruire l'annuncio perfetto.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {previews.length === 0 ? (
        <Card
          className="border-dashed border-2 border-border/50 cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <CardContent className="py-16 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Camera className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold mb-1">Tocca per aggiungere foto</p>
              <p className="text-sm text-muted-foreground">Max 10 immagini • JPG, PNG, WEBP</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Main image */}
          <div className="relative rounded-xl overflow-hidden aspect-square max-h-[300px]">
            <img
              src={previews[mainIndex]}
              alt="Immagine principale"
              className="w-full h-full object-cover"
            />
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
              <Star className="w-3 h-3 mr-1" />
              Principale
            </Badge>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {previews.map((preview, i) => (
              <div key={i} className="relative flex-shrink-0">
                <img
                  src={preview}
                  alt={`Foto ${i + 1}`}
                  className={`w-16 h-16 rounded-lg object-cover cursor-pointer border-2 transition-all ${
                    i === mainIndex ? "border-primary" : "border-transparent"
                  }`}
                  onClick={() => setMainIndex(i)}
                />
                <button
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                  onClick={() => removeFile(i)}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {previews.length < 10 && (
              <button
                className="w-16 h-16 rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center hover:border-primary/50 transition-colors flex-shrink-0"
                onClick={() => inputRef.current?.click()}
              >
                <ImagePlus className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {previews.length === 0 && (
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => onComplete([])}
          >
            Salta (senza foto)
          </Button>
        )}
        {previews.length > 0 && (
          <Button
            variant="neon"
            size="lg"
            className="w-full group"
            onClick={() => onComplete(files)}
          >
            Analizza e prosegui
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default PhotoUploader;
