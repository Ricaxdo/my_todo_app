"use client";

import { Check, Clock, Flag, Trash2, Users } from "lucide-react";
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
}: TaskItemProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
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
  const createdAtDate = toDate(task.createdAt) ?? new Date();

  return (
    <div
      className={`group flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-secondary/30 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 cursor-pointer
        ${
          task.completed
            ? "border-muted-foreground/20 opacity-60"
            : "border-border/50 hover:border-border hover:shadow-md"
        }`}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          task.completed
            ? "bg-primary border-primary text-primary-foreground"
            : "border-muted-foreground/30 group-hover:border-primary"
        }`}
      >
        {task.completed && <Check className="w-3.5 h-3.5" />}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`text-lg font-medium truncate transition-all ${
            task.completed
              ? "text-muted-foreground line-through"
              : "text-foreground"
          }`}
        >
          {task.text}
        </p>

        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span
            className={`flex items-center gap-1.5 text-[11px] max-[349px]:text-[9px] px-2.5 py-1 rounded-full border font-medium ${priority.classes}`}
          >
            <Flag className={`w-3 h-3 ${priority.iconColor}`} />
            {priority.label}
          </span>

          {assigneeLabel && (
            <span className="flex items-center gap-1.5 text-[11px] max-[349px]:text-[9px] px-2.5 py-1 rounded-full bg-secondary/60 border border-border/50 text-muted-foreground">
              <Users className="w-3 h-3" />
              <span className="truncate">{assigneeLabel}</span>
            </span>
          )}

          <span className="flex items-center gap-1.5 text-[11px] max-[349px]:text-[9px] px-2.5 py-1 rounded-full bg-secondary/40 border border-border/30 text-muted-foreground/70">
            <Clock className="w-3 h-3" />
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
        className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive transition-all"
        aria-label="Delete task"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
