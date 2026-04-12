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
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-[1]">
      {floatingLabels.map((item, i) => {
        const fallDuration = 18 + (i % 5) * 4;
        const startDelay = i * 3;
        const floatX = 4 + (i % 4) * 5;

        return (
          <motion.div
            key={i}
            className="absolute top-0"
            style={{ left: item.left }}
            initial={{ y: "-20px", opacity: 0 }}
            animate={{
              y: ["-20px", "95vh"],
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
