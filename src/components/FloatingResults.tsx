import { motion } from "framer-motion";

const soldItems = [
  { img: "/images/sold-1.jpg" },
  { img: "/images/sold-2.jpg" },
  { img: "/images/sold-3.jpg" },
  { img: "/images/sold-4.jpg" },
  { img: "/images/sold-5.jpg" },
  { img: "/images/sold-6.jpg" },
  { img: "/images/sold-7.jpg" },
  { img: "/images/sold-8.jpg" },
];

const FloatingResults = () => {
  return (
    <div className="relative w-full py-6 sm:py-10 overflow-visible">
      <motion.p
        className="text-center text-[10px] sm:text-xs uppercase tracking-[0.3em] text-muted-foreground/60 font-medium mb-6 sm:mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
      >
        Risultati reali
      </motion.p>

      <div className="flex gap-4 sm:gap-6 justify-center flex-wrap px-4 sm:px-0 max-w-3xl mx-auto">
        {soldItems.map((item, i) => {
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
              transition={{ type: "spring", stiffness: 50, damping: 12, delay }}
            >
              <motion.div
                className="absolute inset-0 rounded-xl bg-primary/10 blur-xl scale-110"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: floatDuration + 1, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="relative"
                animate={{
                  y: [-floatY, floatY, -floatY],
                  x: [-floatX, floatX, -floatX],
                  rotate: [rotation - 1.5, rotation + 1.5, rotation - 1.5],
                }}
                transition={{ duration: floatDuration, repeat: Infinity, ease: "easeInOut" }}
              >
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
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default FloatingResults;
