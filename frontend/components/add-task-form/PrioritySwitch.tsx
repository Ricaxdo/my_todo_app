"use client";

import type { Priority } from "@/types/types";
import { PRIORITY_LEVELS } from "./utils/addTaskForm.utils";

type Props = {
  priority: Priority;
  setPriority: (value: Priority) => void;
  sliderPosition: string;
};

export default function PrioritySwitch({
  priority,
  setPriority,
  sliderPosition,
}: Props) {
  return (
    <div className="relative flex items-center rounded-full bg-secondary/60 px-1 py-1 min-w-[10rem] flex-1 max-w-xs">
      {/* Slider */}
      <div
        className={`absolute inset-y-1 left-1 w-1/3 rounded-full bg-background/80 border border-border/60 transition-transform duration-300 ease-out ${sliderPosition}`}
      />

      {PRIORITY_LEVELS.map((level) => {
        const isActive = priority === level;

        const label =
          level === "low" ? "Low" : level === "medium" ? "Medium" : "High";

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
