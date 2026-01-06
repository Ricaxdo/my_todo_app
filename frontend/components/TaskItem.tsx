// src/features/todo/components/TaskItem.tsx
"use client";

import { Calendar, Check, Clock, Flag, Trash2, Users } from "lucide-react";
import type React from "react";
import type { Task } from "../app/types/types";

type AssigneeMember = {
  userId: string;
  name: string;
  lastName?: string;
  isYou?: boolean;
};

type Props = {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;

  members?: AssigneeMember[];
  isPersonalWorkspace?: boolean;
  meId?: string | null;
};

// ✅ Title Case simple (soporta acentos)
function toTitleCase(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");
}

function getAssigneeLabels(
  assigneeIds: string[] | undefined,
  members: AssigneeMember[] = [],
  isPersonalWorkspace?: boolean,
  meId?: string | null
): string[] {
  const ids = Array.isArray(assigneeIds) ? assigneeIds : [];

  // ✅ Todos (comparando sets)
  if (!isPersonalWorkspace) {
    const allIds = new Set<string>(members.map((m) => m.userId));
    if (meId) allIds.add(meId);

    const isAll =
      allIds.size > 0 && Array.from(allIds).every((id) => ids.includes(id));

    if (isAll) return ["Todos"];
  }

  // ✅ Personal
  if (isPersonalWorkspace && meId && ids.includes(meId)) {
    return ["Tú"];
  }

  // ✅ map ids -> labels usando members
  const labels = ids
    .map((id) => members.find((m) => m.userId === id))
    .filter((m): m is AssigneeMember => Boolean(m))
    .map((m) => {
      if (m.isYou) return "Tú";

      // ✅ solo primer nombre (m.name podría traer "Juan Pablo")
      const firstName = (m.name ?? "").trim().split(/\s+/)[0] ?? "";
      return firstName ? toTitleCase(firstName) : "Asignado";
    });

  if (labels.length === 0 && ids.length > 0) return ["Asignado"];

  // ✅ solo 1 label
  return labels.slice(0, 1);
}

export default function TaskItem({
  task,
  onToggle,
  onDelete,
  members,
  isPersonalWorkspace,
  meId,
}: Props) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle();
    }
  };

  const priorityLabel =
    task.priority === "low"
      ? "Low"
      : task.priority === "medium"
      ? "Medium"
      : "High";

  const priorityClasses =
    task.priority === "low"
      ? "text-blue-400 bg-blue-500/10 border-blue-500/30"
      : task.priority === "medium"
      ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
      : "text-red-400 bg-red-500/10 border-red-500/30";

  const priorityIconColor =
    task.priority === "low"
      ? "text-blue-400"
      : task.priority === "medium"
      ? "text-amber-400"
      : "text-red-400";

  const assigneeLabels = getAssigneeLabels(
    task.assignees,
    members ?? [],
    isPersonalWorkspace,
    meId ?? null
  );

  const createdAtDate =
    task.createdAt instanceof Date ? task.createdAt : new Date(task.createdAt);

  const dueDateObj = task.dueDate
    ? task.dueDate instanceof Date
      ? task.dueDate
      : new Date(task.dueDate)
    : null;

  const isOverdue = dueDateObj && !task.completed && dueDateObj < new Date();

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
          className={`text-lg md:text-base  font-medium truncate transition-all ${
            task.completed
              ? "text-muted-foreground line-through"
              : "text-foreground"
          }`}
        >
          {task.text}
        </p>

        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {/* Priority with icon */}
          <span
            className={`flex items-center gap-1.5 text-[11px] max-[349px]:text-[9px] px-2.5 py-1 rounded-full border font-medium ${priorityClasses}`}
          >
            <Flag className={`w-3 h-3 ${priorityIconColor}`} />
            {priorityLabel}
          </span>

          {/* Assignees with icon */}
          {assigneeLabels.length > 0 && (
            <span className="flex items-center gap-1.5 text-[11px] max-[349px]:text-[9px] px-2.5 py-1 rounded-full bg-secondary/80 border border-border text-muted-foreground">
              <Users className="w-3 h-3" />
              <span className="truncate">{assigneeLabels[0]}</span>
            </span>
          )}

          {/* Created time with icon */}
          <span className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 max-[349px]:text-[9px] rounded-full bg-secondary/60 border border-border/50 text-muted-foreground/70">
            <Clock className="w-3 h-3" />
            {createdAtDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {dueDateObj && (
            <span
              className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 max-[349px]:text-[9px] rounded-full border font-medium ${
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
