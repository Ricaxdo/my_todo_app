// src/features/todo/components/TaskItem.tsx
import { Check, Trash2 } from "lucide-react";
import type { Task } from "../app/types/types"; // ajusta el path si hace falta

type Props = {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
};

export default function TaskItem({ task, onToggle, onDelete }: Props) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle();
    }
  };

  // Chip de prioridad
  const priorityLabel =
    task.priority === "low"
      ? "Low"
      : task.priority === "medium"
      ? "Medium"
      : "High";

  const priorityClasses =
    task.priority === "low"
      ? " text-yellow-300 border-500/40"
      : task.priority === "medium"
      ? "text-orange-300 border-500/40"
      : "text-red-300 border-500/40";

  return (
    <div
      className={`group flex items-center gap-4 p-4 rounded-xl border bg-card/50 hover:bg-secondary/50 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 cursor-pointer
        ${
          task.completed
            ? "border-white shadow-[0_0_0_1px_rgba(255,255,255,0.5)]"
            : "border-border/50 hover:border-border"
        }`}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Circulito (checkbox) */}
      <div
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
          task.completed
            ? "bg-primary border-primary text-primary-foreground"
            : "border-muted-foreground/30 group-hover:border-primary group-hover:scale-110"
        }`}
      >
        {task.completed && <Check className="w-3.5 h-3.5" />}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm md:text-base font-medium truncate transition-all ${
            task.completed
              ? "text-muted-foreground line-through"
              : "text-foreground"
          }`}
        >
          {task.text}
        </p>

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {/* Categoría */}
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground uppercase tracking-wider">
            {task.category}
          </span>

          {/* Prioridad */}
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider ${priorityClasses}`}
          >
            {priorityLabel}
          </span>

          {/* Hora de creación */}
          <span className="text-[10px] text-muted-foreground/50">
            {task.createdAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation(); // que no haga toggle
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-red-400 transition-all transform translate-x-2 group-hover:translate-x-0"
        aria-label="Delete task"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
