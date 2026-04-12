import { motion } from "framer-motion";

const soldItems = [
  "/images/sold-1.jpg",
  "/images/sold-2.jpg",
  "/images/sold-3.jpg",
  "/images/sold-4.jpg",
  "/images/sold-5.jpg",
  "/images/sold-6.jpg",
  "/images/sold-7.jpg",
  "/images/sold-8.jpg",
];

// Double the array for seamless infinite scroll
const doubled = [...soldItems, ...soldItems];

const FloatingResults = () => {
  return (
    <div className="relative w-full py-6 sm:py-10 overflow-hidden">
      <motion.p
        className="text-center text-[10px] sm:text-xs uppercase tracking-[0.3em] text-muted-foreground/60 font-medium mb-6 sm:mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
      >
        Risultati reali
      </motion.p>

      {/* Infinite horizontal scroll wrapper */}
      <div className="relative w-full overflow-hidden">
        <motion.div
          className="flex gap-5 sm:gap-7 w-max"
          animate={{ x: [0, -(soldItems.length * (160 + 20))] }}
          transition={{
            x: {
              duration: 35,
              repeat: Infinity,
              ease: "linear",
            },
          }}
        >
          {doubled.map((img, i) => {
            const floatY = 6 + (i % 3) * 4;
            const floatDuration = 3 + (i % 4) * 0.6;

            return (
              <motion.div
                key={i}
                className="flex-shrink-0 w-[120px] sm:w-[150px] md:w-[160px]"
                animate={{ y: [-floatY, floatY, -floatY] }}
                transition={{
                  duration: floatDuration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: (i % soldItems.length) * 0.3,
                }}
              >
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-border/20 bg-card">
                  <img
                    src={img}
                    alt="Articolo venduto"
                    className="w-full h-[220px] sm:h-[260px] md:h-[280px] object-cover"
                    loading="lazy"
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default FloatingResults;
