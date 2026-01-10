"use client";

import { useEffect, useState } from "react";

/**
 * Timestamp "now" sin llamar Date.now() durante render
 * y sin setState directo dentro del cuerpo del effect.
 *
 * - intervalMs = null => solo calcula una vez (al montar)
 * - intervalMs = number => refresca cada X ms
 */
export function useNow(intervalMs: number | null = null) {
  const [now, setNow] = useState(0);

  useEffect(() => {
    // ✅ hacemos el primer setNow desde un callback (timer),
    // así evitamos "setState in effect body"
    const first = window.setTimeout(() => {
      setNow(Date.now());
    }, 0);

    if (intervalMs == null) {
      return () => window.clearTimeout(first);
    }

    const id = window.setInterval(() => {
      setNow(Date.now());
    }, intervalMs);

    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [intervalMs]);

  return now;
}
