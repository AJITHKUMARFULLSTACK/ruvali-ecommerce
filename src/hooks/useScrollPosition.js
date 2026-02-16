import { useState, useEffect } from 'react';

const DEFAULT_THROTTLE_MS = 16; // ~60fps

/**
 * Returns the current scroll position (Y) from the window.
 * Uses requestAnimationFrame for smooth, performant updates.
 * Mobile-safe; avoids layout thrashing.
 */
export function useScrollPosition(throttleMs = DEFAULT_THROTTLE_MS) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let rafId = null;
    let lastTick = 0;

    const handleScroll = () => {
      const now = Date.now();
      if (now - lastTick >= throttleMs) {
        lastTick = now;
        rafId = requestAnimationFrame(() => {
          setScrollY(window.scrollY ?? document.documentElement.scrollTop ?? 0);
          rafId = null;
        });
      }
    };

    setScrollY(window.scrollY ?? document.documentElement.scrollTop ?? 0);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [throttleMs]);

  return scrollY;
}
