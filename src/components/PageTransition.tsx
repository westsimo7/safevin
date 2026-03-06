import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  direction?: "left" | "right" | "up";
}

const variants = {
  left: {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
  },
  right: {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  },
  up: {
    initial: { y: 60, opacity: 0, scale: 0.96 },
    animate: { y: 0, opacity: 1, scale: 1 },
    exit: { y: -40, opacity: 0, scale: 0.97 },
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
        type: "spring",
        stiffness: 100,
        damping: 20,
        mass: 0.8,
      }}
      style={{ minHeight: "100vh" }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
