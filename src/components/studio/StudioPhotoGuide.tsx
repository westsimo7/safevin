import { useRef, useEffect, useState, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import foto1 from "@/assets/studio-guide/foto1.jpg";
import foto2 from "@/assets/studio-guide/foto2.jpg";
import foto3 from "@/assets/studio-guide/foto3.jpg";
import foto4 from "@/assets/studio-guide/foto4.jpg";
import foto5 from "@/assets/studio-guide/foto5.jpg";
import foto6 from "@/assets/studio-guide/foto6.jpg";
import foto7 from "@/assets/studio-guide/foto7.jpg";
import foto8 from "@/assets/studio-guide/foto8.jpg";
import foto9 from "@/assets/studio-guide/foto9.jpg";
import foto10 from "@/assets/studio-guide/foto10.jpg";

const slides = [
  { img: foto1, label: "1. Foto frontale del capo" },
  { img: foto2, label: "2. Primo piano del logo" },
  { img: foto3, label: "3. Etichetta principale" },
  { img: foto4, label: "4. Etichetta materiale" },
  { img: foto5, label: "5. Codice identificativo" },
  { img: foto6, label: "6. Dettaglio (lacci, zip…)" },
  { img: foto7, label: "6. Dettaglio aggiuntivo" },
  { img: foto8, label: "7. Foto retro del capo" },
  { img: foto9, label: "8. Dettaglio retro" },
  { img: foto10, label: "8. Dettaglio retro (2)" },
];

const StudioPhotoGuide = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedSlide, setSelectedSlide] = useState<number | null>(null);

  // Auto-scroll lento continuo verso sinistra
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let raf: number;
    const speed = 0.4;

    const step = () => {
      if (!pausedRef.current && el) {
        el.scrollLeft += speed;
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) {
          el.scrollLeft = 0;
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => cancelAnimationFrame(raf);
  }, []);

  const pauseAndResume = useCallback(() => {
    pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, 1000);
  }, []);

  // Pause on touch/pointer interaction, resume after 1s
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => pauseAndResume();
    el.addEventListener("pointerdown", handler);
    el.addEventListener("touchstart", handler, { passive: true });
    return () => {
      el.removeEventListener("pointerdown", handler);
      el.removeEventListener("touchstart", handler);
    };
  }, [pauseAndResume]);

  const handlePhotoClick = (index: number) => {
    setSelectedSlide(index);
    pausedRef.current = true;
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setSelectedSlide(null);
      pauseAndResume();
    }
  };

  return (
    <>
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
        <p className="text-xs font-semibold text-primary">
          📸 Per un output massimizzato, segui quest'ordine:
        </p>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-1 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {slides.map((s, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[120px] snap-start cursor-pointer"
              onClick={() => handlePhotoClick(i)}
            >
              <div className="aspect-[3/4] rounded-lg overflow-hidden border border-border/40 mb-1.5 active:scale-95 transition-transform">
                <img
                  src={s.img}
                  alt={s.label}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight text-center">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={selectedSlide !== null} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-[90vw] sm:max-w-md p-2 bg-background">
          {selectedSlide !== null && (
            <div className="space-y-2">
              <img
                src={slides[selectedSlide].img}
                alt={slides[selectedSlide].label}
                className="w-full rounded-lg object-contain max-h-[70vh]"
              />
              <p className="text-sm text-center font-medium text-foreground">
                {slides[selectedSlide].label}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StudioPhotoGuide;
