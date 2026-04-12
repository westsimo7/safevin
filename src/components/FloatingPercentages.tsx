import { motion } from "framer-motion";

const floatingLabels = [
  { value: "VENDUTO", top: "5%", left: "6%" },
  { value: "€12", top: "14%", right: "9%" },
  { value: "SELL", top: "25%", left: "3%" },
  { value: "€16", top: "38%", right: "5%" },
  { value: "VENDUTO", top: "48%", left: "8%" },
  { value: "€22", top: "55%", right: "7%" },
  { value: "SELL", top: "65%", left: "4%" },
  { value: "€18", top: "72%", right: "11%" },
  { value: "€34", top: "80%", left: "11%" },
  { value: "VENDUTO", top: "30%", right: "13%" },
  { value: "€15", top: "88%", right: "8%" },
  { value: "€11", top: "42%", left: "12%" },
  { value: "SELL", top: "92%", left: "7%" },
];

const FloatingPercentages = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {floatingLabels.map((item, i) => {
        const fallDuration = 18 + (i % 5) * 4;
        const floatX = 5 + (i % 4) * 6;
        const delay = i * 1.2;

        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: item.left,
              right: item.right,
            }}
            initial={{ top: "-5%", opacity: 0 }}
            animate={{ top: "105%", opacity: [0, 0.7, 0.7, 0] }}
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
