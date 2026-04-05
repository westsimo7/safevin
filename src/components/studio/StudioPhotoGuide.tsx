import { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  { img: foto5, label: "4. Etichetta materiale" },
  { img: foto4, label: "5. Codice identificativo" },
  { img: foto6, label: "6. Dettaglio (lacci, zip…)" },
  { img: foto7, label: "7. Dettaglio aggiuntivo" },
  { img: foto8, label: "8. Foto retro del capo" },
  { img: foto9, label: "9. Dettaglio retro" },
  { img: foto10, label: "10. Dettaglio retro (2)" },
];

const StudioPhotoGuide = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener("scroll", checkScroll, { passive: true });
    return () => el?.removeEventListener("scroll", checkScroll);
  }, []);

  // Auto-scroll lento continuo
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let raf: number;
    let paused = false;
    const speed = 0.4; // px per frame

    const step = () => {
      if (!paused && el) {
        el.scrollLeft += speed;
        // Loop: torna all'inizio quando arriva alla fine
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) {
          el.scrollLeft = 0;
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const pause = () => { paused = true; };
    const resume = () => { paused = false; };
    el.addEventListener("pointerdown", pause);
    el.addEventListener("pointerup", resume);
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("touchend", resume);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerdown", pause);
      el.removeEventListener("pointerup", resume);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
    };
  }, []);

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 160, behavior: "smooth" });
  };

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
      <p className="text-xs font-semibold text-primary">
        📸 Per un output massimizzato, segui quest'ordine:
      </p>

      <div className="relative">
        {canLeft && (
          <button
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-background/90 border border-border/50 shadow flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-1 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {slides.map((s, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[120px] snap-start"
            >
              <div className="aspect-[3/4] rounded-lg overflow-hidden border border-border/40 mb-1.5">
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

        {canRight && (
          <button
            onClick={() => scroll(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-background/90 border border-border/50 shadow flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        )}
      </div>
    </div>
  );
};

export default StudioPhotoGuide;
