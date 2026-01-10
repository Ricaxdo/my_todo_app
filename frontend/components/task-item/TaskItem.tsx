// src/features/todo/components/TaskItem.tsx
"use client";

import { Calendar, Check, Clock, Flag, Trash2, Users } from "lucide-react";
import type React from "react";

import type { TaskItemProps } from "./types/taskItem.types";
import {
  getAssigneeLabel,
  getPriorityMeta,
  toDate,
} from "./utils/taskItem.utils";

export default function TaskItem({
  task,
  onToggle,
  onDelete,
  members,
  isPersonalWorkspace,
  meId,
  now, // ✅ viene del padre (TaskList/Dashboard)
}: TaskItemProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // ✅ accesibilidad: permitir toggle con Enter / Space
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle();
    }
  };

  const priority = getPriorityMeta(task.priority);

  const assigneeLabel = getAssigneeLabel({
    assigneeIds: task.assignees,
    members,
    isPersonalWorkspace,
    meId,
  });

  // ✅ normaliza fechas (Task puede traer string)
  const createdAtDate = toDate(task.createdAt) ?? new Date();
  const dueDateObj = toDate(task.dueDate);

  // ✅ no calcula tiempo aquí, solo compara contra "now" recibido
  const isOverdue =
    Boolean(dueDateObj) &&
    !task.completed &&
    now > 0 &&
    dueDateObj!.getTime() < now;

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
      {/* Checkbox visual */}
      <div
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
          task.completed
            ? "bg-primary border-primary text-primary-foreground"
            : "border-muted-foreground/30 group-hover:border-primary group-hover:scale-110"
        }`}
      >
        {task.completed && <Check className="w-3.5 h-3.5" />}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-lg md:text-base font-medium truncate transition-all ${
            task.completed
              ? "text-muted-foreground line-through"
              : "text-foreground"
          }`}
        >
          {task.text}
        </p>

        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {/* Priority */}
          <span
            className={`flex items-center gap-1.5 text-[11px] max-[349px]:text-[9px] px-2.5 py-1 rounded-full border font-medium ${priority.classes}`}
          >
            <Flag className={`w-3 h-3 ${priority.iconColor}`} />
            {priority.label}
          </span>

          {/* Assignees */}
          {assigneeLabel && (
            <span className="flex items-center gap-1.5 text-[11px] max-[349px]:text-[9px] px-2.5 py-1 rounded-full bg-secondary/80 border border-border text-muted-foreground">
              <Users className="w-3 h-3" />
              <span className="truncate">{assigneeLabel}</span>
            </span>
          )}

          {/* Created time */}
          <span className="flex items-center gap-1.5 text-[11px] max-[349px]:text-[9px] px-2.5 py-1 rounded-full bg-secondary/60 border border-border/50 text-muted-foreground/70">
            <Clock className="w-3 h-3" />
            {createdAtDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {/* Due date */}
          {dueDateObj && (
            <span
              className={`flex items-center gap-1.5 text-[11px] max-[349px]:text-[9px] px-2.5 py-1 rounded-full border font-medium ${
                isOverdue
                  ? "text-red-400 bg-red-500/10 border-red-500/30"
                  : "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
              }`}
            >
              <Calendar className="w-3 h-3" />
              {dueDateObj.toLocaleDateString([], {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={(e) => {
          e.stopPropagation();
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
