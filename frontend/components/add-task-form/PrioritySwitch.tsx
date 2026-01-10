"use client";

import type { Priority } from "@/types/types";
import { PRIORITY_LEVELS } from "./utils/addTaskForm.utils";

type Props = {
  priority: Priority;
  setPriority: (value: Priority) => void;

  /**
   * Clase de Tailwind que controla la posición del slider
   * (translate-x-0 / translate-x-full / etc.)
   * Se calcula fuera para mantener este componente puramente visual.
   */
  sliderPosition: string;
};

/**
 * Switch visual para seleccionar la prioridad de una tarea.
 * Componente controlado: no guarda estado propio.
 */
export default function PrioritySwitch({
  priority,
  setPriority,
  sliderPosition,
}: Props) {
  return (
    <div className="relative flex items-center rounded-full bg-secondary/60 px-1 py-1 min-w-[10rem] flex-1 max-w-xs">
      {/* 
        Slider animado:
        - Se posiciona vía clases (sliderPosition)
        - No conoce la lógica de prioridad
      */}
      <div
        className={`absolute inset-y-1 left-1 w-1/3 rounded-full bg-background/80 border border-border/60 transition-transform duration-300 ease-out ${sliderPosition}`}
      />

      {PRIORITY_LEVELS.map((level) => {
        const isActive = priority === level;

        // Labels humanos para UI (no usar directamente los enums)
        const label =
          level === "low" ? "Low" : level === "medium" ? "Medium" : "High";

        // Color activo por prioridad (solo afecta texto)
        const activeColor =
          level === "low"
            ? "text-yellow-300"
            : level === "medium"
            ? "text-orange-300"
            : "text-red-300";

        return (
          <button
            key={level}
            type="button"
            onClick={() => setPriority(level)}
            className={`relative z-10 flex-1 text-xs font-medium py-2 text-center transition-colors ${
              isActive ? activeColor : "text-muted-foreground/60"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
