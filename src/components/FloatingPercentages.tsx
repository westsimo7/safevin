import { motion } from "framer-motion";

const percentages = [
  { value: "+87%", top: "8%", left: "5%" },
  { value: "+134%", top: "15%", right: "8%" },
  { value: "+234%", top: "35%", left: "3%" },
  { value: "+56%", top: "50%", right: "4%" },
  { value: "+178%", top: "62%", left: "7%" },
  { value: "+42%", top: "72%", right: "6%" },
  { value: "+93%", top: "82%", left: "10%" },
  { value: "+31%", top: "28%", right: "12%" },
  { value: "+112%", top: "45%", left: "12%" },
  { value: "+67%", top: "90%", right: "10%" },
];

const FloatingPercentages = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {percentages.map((item, i) => {
        const floatDuration = 5 + (i % 4) * 1.5;
        const floatY = 20 + (i % 3) * 15;
        const floatX = 10 + (i % 5) * 8;
        const delay = i * 0.3;

        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: item.top,
              left: item.left,
              right: item.right,
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.5 + delay }}
          >
            <motion.span
              className="inline-block bg-primary/90 text-primary-foreground text-[10px] sm:text-xs md:text-sm font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-lg shadow-primary/20 backdrop-blur-sm border border-primary/30"
              animate={{
                y: [-floatY, floatY, -floatY],
                x: [-floatX, floatX, -floatX],
                rotate: [-5, 5, -5],
                scale: [1, 1.08, 1, 0.95, 1],
              }}
              transition={{
                duration: floatDuration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: delay * 0.5,
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
