import { useEffect, useRef } from "react";

const soldItems = [
  "/images/sold-1.jpg",
  "/images/sold-2.jpg",
  "/images/sold-3.jpg",
];

const FloatingResults = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const posRef = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const speed = 0.5; // px per frame

    const tick = () => {
      posRef.current += speed;
      // Reset seamlessly when we've scrolled past the first set
      const halfWidth = el.scrollWidth / 2;
      if (posRef.current >= halfWidth) {
        posRef.current -= halfWidth;
      }
      el.style.transform = `translate3d(-${posRef.current}px, 0, 0)`;
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // Triple the items for seamless loop
  const tripled = [...soldItems, ...soldItems, ...soldItems];

  return (
    <div className="relative w-full py-6 sm:py-10 overflow-hidden">
      <div className="relative w-full overflow-hidden">
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 w-max will-change-transform"
          style={{ backfaceVisibility: "hidden" }}
        >
          {tripled.map((img, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[110px] sm:w-[140px] md:w-[160px] animate-float"
              style={{
                animationDelay: `${(i % soldItems.length) * 0.4}s`,
                animationDuration: `${3 + (i % 3) * 0.5}s`,
              }}
            >
              <div className="rounded-t-2xl rounded-b-lg overflow-hidden shadow-2xl shadow-primary/10 border border-border/20">
                <img
                  src={img}
                  alt="Articolo venduto"
                  className="w-full h-auto object-cover aspect-[3/4]"
                  loading="lazy"
                  draggable={false}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FloatingResults;
