// src/features/todo/components/TaskItem.tsx
"use client";

import type { WorkspaceMember } from "@/features/workspaces/workspace-context";
import { Check, Trash2, Users } from "lucide-react";
import type React from "react";
import type { Task } from "../app/types/types";

type Props = {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;

  // ✅ ahora opcional para evitar crash mientras carga
  members?: WorkspaceMember[];

  isPersonalWorkspace?: boolean;
  meId?: string | null;
};

function getAssigneeLabels(
  assigneeIds: string[] | undefined,
  members: WorkspaceMember[] = [],
  isPersonalWorkspace?: boolean,
  meId?: string | null
): string[] {
  const ids = Array.isArray(assigneeIds) ? assigneeIds : [];

  if (isPersonalWorkspace && meId && ids.includes(meId)) {
    return ["Tú"];
  }

  const labels = ids
    .map((id) => members.find((m) => m.userId === id))
    .filter((m): m is WorkspaceMember => Boolean(m))
    .map((m) =>
      m.isYou ? "Tú" : `${m.name}${m.lastName ? ` ${m.lastName}` : ""}`.trim()
    );

  if (labels.length === 0 && ids.length > 0) return ["Asignado"];
  return labels;
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
      ? "text-yellow-300 border-500/40"
      : task.priority === "medium"
      ? "text-orange-300 border-500/40"
      : "text-red-300 border-500/40";

  const assigneeLabels = getAssigneeLabels(
    task.assignees,
    members ?? [],
    isPersonalWorkspace,
    meId ?? null
  );

  const createdAtDate =
    task.createdAt instanceof Date ? task.createdAt : new Date(task.createdAt);

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
          className={`text-sm md:text-base font-medium truncate transition-all ${
            task.completed
              ? "text-muted-foreground line-through"
              : "text-foreground"
          }`}
        >
          {task.text}
        </p>

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground uppercase tracking-wider">
            {task.category}
          </span>

          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider ${priorityClasses}`}
          >
            {priorityLabel}
          </span>

          {assigneeLabels.length > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
              <Users className="w-3 h-3 opacity-70" />
              <span className="flex flex-wrap gap-1">
                {assigneeLabels.map((label) => (
                  <span
                    key={label}
                    className="px-2 py-0.5 rounded-full bg-secondary border border-border"
                  >
                    {label}
                  </span>
                ))}
              </span>
            </span>
          )}

          <span className="text-[10px] text-muted-foreground/50">
            {createdAtDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
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
