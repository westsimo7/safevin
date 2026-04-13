import { useRef, useEffect, useState, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  // Swipe state for mobile dialog
  const touchStartRef = useRef<number | null>(null);

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let raf: number;
    const speed = window.innerWidth < 640 ? 0.2 : 0.1;
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

  const goToPrev = useCallback(() => {
    setSelectedSlide((prev) => (prev !== null ? (prev - 1 + slides.length) % slides.length : null));
  }, []);

  const goToNext = useCallback(() => {
    setSelectedSlide((prev) => (prev !== null ? (prev + 1) % slides.length : null));
  }, []);

  // Keyboard arrows for desktop
  useEffect(() => {
    if (selectedSlide === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); goToPrev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); goToNext(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedSlide, goToPrev, goToNext]);

  // Touch handlers for mobile swipe in dialog
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartRef.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToPrev();
      else goToNext();
    }
    touchStartRef.current = null;
  };

  return (
    <>
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-2 h-full flex flex-col">
        <p className="text-xs font-semibold text-primary shrink-0">
          📸 L'ordine che rende le tue immagini complete
        </p>

        <div
          ref={scrollRef}
          className="flex gap-2.5 overflow-x-auto scrollbar-hide px-1 flex-1 items-stretch"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {duplicatedSlides.map((s, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[100px] sm:w-[160px] cursor-pointer flex flex-col"
              onClick={() => handlePhotoClick(i % slides.length)}
            >
              <div className="flex-1 rounded-lg overflow-hidden border border-border/40 mb-1 active:scale-95 transition-transform">
                <img src={s.img} alt={s.label} className="w-full h-full object-cover" loading="lazy" />
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
            <div
              className="space-y-2 relative select-none"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={slides[selectedSlide].img}
                alt={slides[selectedSlide].label}
                className="w-full rounded-lg object-contain max-h-[70vh]"
                draggable={false}
              />
              <p className="text-sm text-center font-medium text-foreground">
                {slides[selectedSlide].label}
              </p>
              <p className="text-xs text-center text-muted-foreground">
                {selectedSlide + 1} / {slides.length}
              </p>

              {/* Desktop arrow buttons */}
              {!isMobile && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[calc(100%+8px)] bg-background/80 backdrop-blur-sm border border-border rounded-full p-1.5 hover:bg-accent transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 text-foreground" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); goToNext(); }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+8px)] bg-background/80 backdrop-blur-sm border border-border rounded-full p-1.5 hover:bg-accent transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-foreground" />
                  </button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StudioPhotoGuide;
