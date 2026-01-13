"use client";

import { useEffect, useState } from "react";

export function useNeedsAsideNudge(
  containerRef: React.RefObject<HTMLElement | null>,
  opts: { thresholdPx?: number } = {}
) {
  const thresholdPx = opts.thresholdPx ?? 24;
  const [needsNudge, setNeedsNudge] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const gap = el.clientHeight - el.scrollHeight;
      setNeedsNudge(gap > thresholdPx);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);

    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [containerRef, thresholdPx]);

  return needsNudge;
}
