import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const soldItems = [
  { img: "/images/sold-1.jpg", pct: "+87%" },
  { img: "/images/sold-2.jpg", pct: "+134%" },
  { img: "/images/sold-3.jpg", pct: "+234%" },
  { img: "/images/sold-4.jpg", pct: "+56%" },
  { img: "/images/sold-5.jpg", pct: "+178%" },
  { img: "/images/sold-6.jpg", pct: "+42%" },
  { img: "/images/sold-7.jpg", pct: "+93%" },
  { img: "/images/sold-8.jpg", pct: "+31%" },
];

const FloatingResults = () => {
  const titleRef = useScrollReveal({ direction: "up", delay: 0.1 });

  return (
    <section className="relative py-16 sm:py-24 overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-card/30 via-background to-background" />

      <div className="relative z-10 container mx-auto px-4">
        <p
          ref={titleRef}
          className="text-center text-xs sm:text-sm uppercase tracking-[0.25em] text-muted-foreground font-medium mb-10 sm:mb-14"
        >
          Risultati reali dei nostri utenti
        </p>

        {/* Horizontal scrolling row */}
        <div className="relative flex gap-5 sm:gap-7 overflow-x-auto pb-4 scrollbar-hide justify-start sm:justify-center flex-nowrap">
          {soldItems.map((item, i) => {
            const floatY = 8 + (i % 3) * 6;
            const floatDuration = 3 + (i % 4) * 0.7;
            const delay = i * 0.12;
            const rotation = ((i % 5) - 2) * 2.5;

            return (
              <motion.div
                key={i}
                className="relative flex-shrink-0"
                initial={{ opacity: 0, y: 40, scale: 0.85 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  type: "spring",
                  stiffness: 60,
                  damping: 14,
                  delay,
                }}
              >
                <motion.div
                  className="relative"
                  animate={{ y: [-floatY / 2, floatY / 2, -floatY / 2] }}
                  transition={{
                    duration: floatDuration,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ rotate: `${rotation}deg` }}
                >
                  {/* Card */}
                  <div className="w-28 sm:w-36 md:w-40 rounded-xl overflow-hidden border border-border/40 shadow-lg bg-card">
                    <img
                      src={item.img}
                      alt="Articolo venduto"
                      className="w-full h-36 sm:h-44 md:h-48 object-cover"
                      loading="lazy"
                    />
                    <div className="px-2 py-1.5 flex items-center justify-center">
                      <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">
                        Venduto ✓
                      </span>
                    </div>
                  </div>

                  {/* Floating percentage badge */}
                  <motion.div
                    className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-primary text-primary-foreground text-[11px] sm:text-xs font-bold px-2 py-1 rounded-full shadow-md border-2 border-background"
                    animate={{
                      y: [0, -4, 0, 3, 0],
                      rotate: [0, 3, 0, -2, 0],
                    }}
                    transition={{
                      duration: floatDuration + 1,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: delay + 0.5,
                    }}
                  >
                    {item.pct}
                  </motion.div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FloatingResults;
