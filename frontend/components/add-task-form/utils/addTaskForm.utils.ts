import type { Priority } from "@/types/types";

export const PRIORITY_LEVELS: Priority[] = ["low", "medium", "high"];

/** Normaliza a inicio del día para evitar bugs de comparación por hora. */
export function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Title Case simple (soporta acentos). */
export function toTitleCase(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");
}

/** Posición del slider del priority switch (mantiene tu look & feel). */
export function prioritySliderPosition(priority: Priority) {
  return priority === "low"
    ? "translate-x-0"
    : priority === "medium"
    ? "translate-x-[93%]"
    : "translate-x-[190%]";
}
