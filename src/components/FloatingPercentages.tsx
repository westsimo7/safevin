import { motion } from "framer-motion";

const floatingLabels = [
  { value: "VENDUTO", left: "4%" },
  { value: "€12", left: "88%" },
  { value: "SELL", left: "15%" },
  { value: "€16", left: "82%" },
  { value: "VENDUTO", left: "7%" },
  { value: "€22", left: "92%" },
  { value: "SELL", left: "2%" },
  { value: "€18", left: "78%" },
  { value: "€34", left: "12%" },
  { value: "VENDUTO", left: "85%" },
  { value: "€15", left: "90%" },
  { value: "€11", left: "10%" },
  { value: "SELL", left: "5%" },
];

const FloatingPercentages = () => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
      {floatingLabels.map((item, i) => {
        // Stagger start positions so they're well spread out
        const fallDuration = 25 + (i % 5) * 6;
        const startDelay = i * 3;
        const floatX = 4 + (i % 4) * 5;

        return (
          <motion.div
            key={i}
            className="absolute top-0"
            style={{ left: item.left }}
            initial={{ y: "-5vh", opacity: 0 }}
            animate={{
              y: ["-5vh", "500vh"],
              opacity: [0, 0.6, 0.6, 0.6, 0],
            }}
            transition={{
              duration: fallDuration,
              repeat: Infinity,
              ease: "linear",
              delay: startDelay,
            }}
          >
            <motion.span
              className="inline-block bg-primary/10 text-primary/40 text-[10px] sm:text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-primary/10"
              animate={{
                x: [-floatX, floatX, -floatX],
                rotate: [-3, 3, -3],
              }}
              transition={{
                duration: 4 + (i % 3),
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {item.value}
            </motion.span>
          </motion.div>
        );
      })}
    </div>
  );
};

export default FloatingPercentages;
