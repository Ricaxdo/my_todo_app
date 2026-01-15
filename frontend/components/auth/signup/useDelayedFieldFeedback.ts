"use client";

import { useRef, useState } from "react";

/**
 * Hook para feedback con delay por campo (bordes rojo/verde, etc.)
 * - showFeedback: controla si ya se “muestra” el feedback visual
 * - schedule: programa una función que corre después del delay
 */
export function useDelayedFieldFeedback<FieldKey extends string>(
  keys: readonly FieldKey[],
  delayMs = 800
) {
  const initial = Object.fromEntries(keys.map((k) => [k, false])) as Record<
    FieldKey,
    boolean
  >;

  const [showFeedback, setShowFeedback] =
    useState<Record<FieldKey, boolean>>(initial);

  const timers = useRef<Partial<Record<FieldKey, number>>>({});

  function schedule(key: FieldKey, cb: () => void) {
    setShowFeedback((prev) => ({ ...prev, [key]: false }));

    const existing = timers.current[key];
    if (existing) window.clearTimeout(existing);

    timers.current[key] = window.setTimeout(() => {
      setShowFeedback((prev) => ({ ...prev, [key]: true }));
      cb();
    }, delayMs);
  }

  return { showFeedback, schedule };
}
