import { motion } from "framer-motion";

const floatingLabels = [
  { value: "VENDUTO", left: "6%" },
  { value: "€12", right: "9%", left: undefined },
  { value: "SELL", left: "3%" },
  { value: "€16", right: "5%", left: undefined },
  { value: "VENDUTO", left: "8%" },
  { value: "€22", right: "7%", left: undefined },
  { value: "SELL", left: "4%" },
  { value: "€18", right: "11%", left: undefined },
  { value: "€34", left: "11%" },
  { value: "VENDUTO", right: "13%", left: undefined },
  { value: "€15", right: "8%", left: undefined },
  { value: "€11", left: "12%" },
  { value: "SELL", left: "7%" },
];

const FloatingPercentages = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {floatingLabels.map((item, i) => {
        const fallDuration = 20 + (i % 5) * 5;
        const floatX = 5 + (i % 4) * 6;
        const delay = i * 1.5;

        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: item.left,
              right: item.right,
              top: 0,
            }}
            animate={{ y: ["-10vh", "110vh"] }}
            transition={{
              duration: fallDuration,
              repeat: Infinity,
              ease: "linear",
              delay,
            }}
          >
            <motion.span
              className="inline-block bg-primary/15 text-primary/50 text-[10px] sm:text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-primary/10"
              style={{ textShadow: "0 0 8px hsl(var(--primary) / 0.15)" }}
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
