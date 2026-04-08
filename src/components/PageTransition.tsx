import { motion } from "framer-motion";
import { ReactNode, useRef, useEffect } from "react";

interface PageTransitionProps {
  children: ReactNode;
  direction?: "left" | "right" | "up";
}

const PageTransition = ({ children, direction = "left" }: PageTransitionProps) => {
  const isPopState = useRef(false);

  useEffect(() => {
    const handler = () => { isPopState.current = true; };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => { isPopState.current = false; });
    return () => cancelAnimationFrame(id);
  });

  if (isPopState.current) {
    return <div className="flex flex-col flex-1 overflow-hidden">{children}</div>;
  }

  const variants: Record<string, any> = {
    left: { initial: { opacity: 0 }, animate: { opacity: 1 } },
    right: { initial: { opacity: 0 }, animate: { opacity: 1 } },
    up: { initial: { opacity: 0 }, animate: { opacity: 1 } },
  };

  const v = variants[direction];

  return (
    <motion.div
      initial={v.initial}
      animate={v.animate}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex flex-col flex-1 overflow-hidden"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
