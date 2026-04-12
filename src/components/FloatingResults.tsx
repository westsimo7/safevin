import { motion } from "framer-motion";

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
  return (
    <div className="relative w-full py-6 sm:py-10 overflow-visible">
      {/* Subtle label */}
      <motion.p
        className="text-center text-[10px] sm:text-xs uppercase tracking-[0.3em] text-muted-foreground/60 font-medium mb-6 sm:mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
      >
        Risultati reali
      </motion.p>

      {/* Floating items row */}
      <div className="flex gap-4 sm:gap-6 justify-center flex-wrap px-4 sm:px-0 max-w-3xl mx-auto">
        {soldItems.map((item, i) => {
          // Unique float parameters per item
          const floatY = 10 + (i % 3) * 8;
          const floatX = 3 + (i % 4) * 2;
          const floatDuration = 4 + (i % 5) * 0.8;
          const delay = 0.8 + i * 0.15;
          const rotation = ((i % 7) - 3) * 3;

          return (
            <motion.div
              key={i}
              className="relative flex-shrink-0"
              initial={{ opacity: 0, y: 60, scale: 0.7, rotate: rotation * 2 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: rotation }}
              transition={{
                type: "spring",
                stiffness: 50,
                damping: 12,
                delay,
              }}
            >
              {/* Glow behind card */}
              <motion.div
                className="absolute inset-0 rounded-xl bg-primary/10 blur-xl scale-110"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: floatDuration + 1, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Floating card with space effect */}
              <motion.div
                className="relative"
                animate={{
                  y: [-floatY, floatY, -floatY],
                  x: [-floatX, floatX, -floatX],
                  rotate: [rotation - 1.5, rotation + 1.5, rotation - 1.5],
                }}
                transition={{
                  duration: floatDuration,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {/* Card */}
                <div className="w-20 sm:w-28 md:w-32 rounded-xl overflow-hidden border border-border/30 shadow-2xl bg-card/80 backdrop-blur-sm">
                  <img
                    src={item.img}
                    alt="Articolo venduto"
                    className="w-full h-28 sm:h-36 md:h-40 object-cover"
                    loading="lazy"
                  />
                  <div className="px-1.5 py-1 flex items-center justify-center bg-card/90">
                    <span className="text-[8px] sm:text-[10px] font-medium text-muted-foreground">
                      Venduto ✓
                    </span>
                  </div>
                </div>

                {/* Floating percentage badge */}
                <motion.div
                  className="absolute -top-2.5 -right-2.5 sm:-top-3 sm:-right-3 bg-primary text-primary-foreground text-[9px] sm:text-[11px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full shadow-lg shadow-primary/30 border-2 border-background"
                  animate={{
                    y: [0, -6, 0, 4, 0],
                    x: [0, 2, 0, -2, 0],
                    scale: [1, 1.05, 1, 0.97, 1],
                  }}
                  transition={{
                    duration: floatDuration + 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.2,
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
  );
};

export default FloatingResults;
