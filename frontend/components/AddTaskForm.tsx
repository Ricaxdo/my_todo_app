"use client";

import { Plus } from "lucide-react";
import React from "react";
import type { Priority } from "../app/types/types";

type Props = {
  newTask: string;
  setNewTask: (value: string) => void;
  priority: Priority;
  setPriority: (value: Priority) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

const PRIORITY_LEVELS: Priority[] = ["low", "medium", "high"];

export default function AddTaskForm({
  newTask,
  setNewTask,
  priority,
  setPriority,
  onSubmit,
}: Props) {
  // Posición del slider según prioridad
  const sliderPosition =
    priority === "low"
      ? "translate-x-0"
      : priority === "medium"
      ? "translate-x-[93%]"
      : "translate-x-[190%]";

  return (
    <form onSubmit={onSubmit} className="relative group">
      {/* Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative p-2 bg-card border border-border rounded-xl shadow-2xl transition-all focus-within:ring-1 focus-within:ring-white/20 focus-within:border-white/20">
        {/* TOP ROW (siempre fila): icon + input + priority (solo desktop) */}
        <div className="flex items-center gap-3">
          {/* Icono */}
          <div className="p-3 bg-secondary rounded-lg text-muted-foreground shrink-0">
            <Plus className="w-5 h-5" />
          </div>

          {/* Input (se queda junto al + siempre) */}
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground/50 h-10"
          />

          {/* PRIORITY — Desktop inline */}
          <div className="relative flex items-center rounded-full bg-secondary/60 px-1 py-1 min-w-[8rem] max-[550px]:hidden shrink-0">
            {/* Slider */}
            <div
              className={`absolute inset-y-1 left-1 w-1/3 rounded-full bg-background/80 border border-border/60 transition-transform duration-300 ease-out ${sliderPosition}`}
            />

            {PRIORITY_LEVELS.map((level) => {
              const isActive = priority === level;
              const label =
                level === "low"
                  ? "Low"
                  : level === "medium"
                  ? "Medium"
                  : "High";

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
                  className={`relative z-10 flex-1 text-[11px] font-medium py-1 text-center w-[60px] transition-colors ${
                    isActive ? activeColor : "text-muted-foreground/60"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* PRIORITY — Mobile debajo del input */}
        <div className="mt-3 hidden max-[550px]:block">
          <div className="relative flex items-center rounded-full bg-secondary/60 px-1 py-1 w-full">
            {/* Slider */}
            <div
              className={`absolute inset-y-1 left-1 w-1/3 rounded-full bg-background/80 border border-border/60 transition-transform duration-300 ease-out ${sliderPosition}`}
            />

            {PRIORITY_LEVELS.map((level) => {
              const isActive = priority === level;
              const label =
                level === "low"
                  ? "Low"
                  : level === "medium"
                  ? "Medium"
                  : "High";

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
        </div>
      </div>
    </form>
  );
}
