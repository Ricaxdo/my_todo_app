"use client";

import type { Priority } from "@/types/types";
import { ArrowDown, Flame, Minus } from "lucide-react";

import { PRIORITY_LEVELS } from "../utils/addTaskForm.utils";

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

function labelFor(level: Priority) {
  return level === "low" ? "Low" : level === "medium" ? "Medium" : "High";
}

function activeColorFor(level: Priority) {
  return level === "low"
    ? "text-yellow-300"
    : level === "medium"
    ? "text-orange-300"
    : "text-red-300";
}

function IconFor(level: Priority) {
  return level === "low" ? ArrowDown : level === "medium" ? Minus : Flame;
}

/**
 * Switch visual para seleccionar la prioridad de una tarea.
 * - Desktop (>=701): slider + texto (actual)
 * - Mobile (<701): botones compactos con icono
 */
export default function PrioritySwitch({
  priority,
  setPriority,
  sliderPosition,
}: Props) {
  return (
    <>
      {/* =========================
          MOBILE (<701): iconos
         ========================= */}
      <div className="min-[800px]:hidden inline-flex items-center gap-1 rounded-full bg-secondary/60 px-1 py-1">
        {PRIORITY_LEVELS.map((level) => {
          const isActive = priority === level;
          const Icon = IconFor(level);

          return (
            <button
              key={level}
              type="button"
              onClick={() => setPriority(level)}
              className={[
                "h-7 w-7   grid place-items-center rounded-full transition-colors",
                isActive ? "bg-background/80 border border-border/60" : "",
              ].join(" ")}
              aria-label={`Priority ${labelFor(level)}`}
              title={`Priority ${labelFor(level)}`}
            >
              <Icon
                className={[
                  "h-4 w-4",
                  isActive ? activeColorFor(level) : "text-muted-foreground/60",
                ].join(" ")}
              />
            </button>
          );
        })}
      </div>

      {/* =========================
          DESKTOP (>=701): tu switch actual
         ========================= */}
      <div className="hidden min-[800px]:flex relative items-center rounded-full bg-secondary/60 px-1 py-1 min-w-[10rem] flex-1 max-w-xs">
        <div
          className={[
            "absolute inset-y-1 left-1 w-1/3 rounded-full",
            "bg-background/80 border border-border/60",
            "transition-transform duration-300 ease-out",
            sliderPosition,
          ].join(" ")}
        />

        {PRIORITY_LEVELS.map((level) => {
          const isActive = priority === level;

          const label = labelFor(level);
          const activeColor = activeColorFor(level);

          return (
            <button
              key={level}
              type="button"
              onClick={() => setPriority(level)}
              className={[
                "relative z-10 flex-1 text-xs font-medium py-2 text-center transition-colors",
                isActive ? activeColor : "text-muted-foreground/60",
              ].join(" ")}
            >
              {label}
            </button>
          );
        })}
      </div>
    </>
  );
}
