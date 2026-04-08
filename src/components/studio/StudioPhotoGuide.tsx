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
  { img: foto4, label: "4. Codice identificativo" },
  { img: foto5, label: "5. Etichetta materiale" },
  { img: foto6, label: "6. Dettaglio (lacci, zip…)" },
  { img: foto7, label: "6. Dettaglio aggiuntivo" },
  { img: foto8, label: "7. Foto retro del capo" },
  { img: foto9, label: "8. Dettaglio retro" },
  { img: foto10, label: "8. Dettaglio retro (2)" },
];

const duplicatedSlides = [...slides, ...slides];

const StudioPhotoGuide = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const scrollPositionRef = useRef(0);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedSlide, setSelectedSlide] = useState<number | null>(null);

  // Auto-scroll lento continuo verso sinistra
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let raf: number;
    const speed = 0.175;

    scrollPositionRef.current = el.scrollLeft;

    const step = () => {
      if (!pausedRef.current && el) {
        const loopPoint = el.scrollWidth / 2;
        scrollPositionRef.current += speed;

        if (scrollPositionRef.current >= loopPoint) {
          scrollPositionRef.current = 0;
        }

        el.scrollLeft = scrollPositionRef.current;
      }

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
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

    const syncScrollPosition = () => {
      scrollPositionRef.current = el.scrollLeft;
    };

    const handler = () => pauseAndResume();

    el.addEventListener("pointerdown", handler);
    el.addEventListener("touchstart", handler, { passive: true });
    el.addEventListener("scroll", syncScrollPosition, { passive: true });

    return () => {
      el.removeEventListener("pointerdown", handler);
      el.removeEventListener("touchstart", handler);
      el.removeEventListener("scroll", syncScrollPosition);
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
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-2 h-full flex flex-col">
        <p className="text-xs font-semibold text-primary shrink-0">
          📸 Per un output massimizzato, segui quest'ordine:
        </p>

        <div
          ref={scrollRef}
          className="flex gap-2.5 overflow-x-auto scrollbar-hide px-1 flex-1 items-stretch"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {duplicatedSlides.map((s, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[160px] cursor-pointer flex flex-col"
              onClick={() => handlePhotoClick(i % slides.length)}
            >
              <div className="flex-1 rounded-lg overflow-hidden border border-border/40 mb-1 active:scale-95 transition-transform">
                <img
                  src={s.img}
                  alt={s.label}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <p className="text-[9px] text-muted-foreground leading-tight text-center shrink-0">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-muted-foreground italic shrink-0">
          💡 Usa uno sfondo a contrasto con il prodotto.
        </p>
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
