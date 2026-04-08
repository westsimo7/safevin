import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/**
 * On mobile, enables swipe from left edge to go back.
 */
export function useSwipeBack(fallbackPath?: string) {
  const navigate = useNavigate();
  const startX = useRef(0);
  const startY = useRef(0);

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      // Only trigger from left edge (first 30px)
      if (touch.clientX < 30) {
        startX.current = touch.clientX;
        startY.current = touch.clientY;
      } else {
        startX.current = -1;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (startX.current < 0) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - startX.current;
      const dy = Math.abs(touch.clientY - startY.current);
      // Swipe right at least 80px, mostly horizontal
      if (dx > 80 && dy < dx * 0.5) {
        if (fallbackPath) {
          navigate(fallbackPath);
        } else {
          navigate(-1);
        }
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [navigate, fallbackPath]);
}
