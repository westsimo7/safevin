import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  direction?: "left" | "right" | "up";
}

const variants = {
  left: {
    initial: { x: 40, opacity: 0, filter: "blur(6px)" },
    animate: { x: 0, opacity: 1, filter: "blur(0px)" },
    exit: { x: -20, opacity: 0, filter: "blur(4px)" },
  },
  right: {
    initial: { x: -40, opacity: 0, filter: "blur(6px)" },
    animate: { x: 0, opacity: 1, filter: "blur(0px)" },
    exit: { x: 20, opacity: 0, filter: "blur(4px)" },
  },
  up: {
    initial: { y: 18, opacity: 0, filter: "blur(6px)" },
    animate: { y: 0, opacity: 1, filter: "blur(0px)" },
    exit: { y: -10, opacity: 0, filter: "blur(4px)" },
  },
};

const PageTransition = ({ children, direction = "left" }: PageTransitionProps) => {
  const v = variants[direction];

  return (
    <motion.div
      initial={v.initial}
      animate={v.animate}
      exit={v.exit}
      transition={{
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ minHeight: "100vh" }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
