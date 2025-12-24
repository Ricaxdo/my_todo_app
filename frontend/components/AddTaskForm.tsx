"use client";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addWeeks, format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, ChevronDown, Plus, Users } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import type { Priority } from "../app/types/types";

type DueDateOption = "today" | "week" | "custom";
type Member = { id: string; name: string };

type Props = {
  newTask: string;
  setNewTask: (value: string) => void;
  priority: Priority;
  setPriority: (value: Priority) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;

  dueDate: Date;
  setDueDate: (date: Date) => void;

  isPersonalWorkspace: boolean;
  meId: string;
  members: Member[];
  assignees: string[];
  setAssignees: React.Dispatch<React.SetStateAction<string[]>>;
};

const PRIORITY_LEVELS: Priority[] = ["low", "medium", "high"];

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default function AddTaskForm({
  newTask,
  setNewTask,
  priority,
  setPriority,
  onSubmit,
  dueDate,
  setDueDate,
  isPersonalWorkspace,
  meId,
  members,
  assignees,
  setAssignees,
}: Props) {
  const [dueDateOption, setDueDateOption] = useState<DueDateOption>("today");
  const [customDate, setCustomDate] = useState<Date>(() => startOfDay(dueDate));

  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [isAssignPopoverOpen, setIsAssignPopoverOpen] = useState(false);

  // ✅ estable
  const today = useMemo(() => startOfDay(new Date()), []);

  const sliderPosition =
    priority === "low"
      ? "translate-x-0"
      : priority === "medium"
      ? "translate-x-[93%]"
      : "translate-x-[190%]";

  // ✅ calcula la fecha que se ve / se manda
  const effectiveDate = useMemo(() => {
    if (dueDateOption === "today") return today;
    if (dueDateOption === "week") return addWeeks(today, 1);
    return customDate;
  }, [dueDateOption, customDate, today]);

  // ✅ empuja al parent SOLO si cambia
  useEffect(() => {
    const next = effectiveDate.getTime();
    const curr = startOfDay(dueDate).getTime();

    if (curr !== next) {
      setDueDate(effectiveDate);
    }
  }, [effectiveDate, dueDate, setDueDate]);

  // ✅ en personal: siempre asignado a mí
  useEffect(() => {
    if (!isPersonalWorkspace) return;
    if (assignees.length !== 1 || assignees[0] !== meId) setAssignees([meId]);
  }, [isPersonalWorkspace, meId, assignees, setAssignees]);

  // ✅ cuando el usuario elige custom, actualiza customDate
  const handleCustomDateSelect = (date: Date | undefined) => {
    if (!date) return;
    const normalized = startOfDay(date);
    setCustomDate(normalized);
    setDueDateOption("custom");
    setIsDatePopoverOpen(false);
  };

  const getDateButtonText = () => {
    if (dueDateOption === "today") return "Hoy";
    if (dueDateOption === "week") return "1 Semana";
    return format(customDate, "d MMM", { locale: es });
  };

  const toggleAssignee = (id: string) => {
    if (isPersonalWorkspace) return;

    setAssignees((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((x) => x !== id);
        return next.length ? next : [meId];
      }
      return [...prev, id];
    });
  };

  const assigneeLabel = useMemo(() => {
    if (isPersonalWorkspace) return "Asignado a mí";
    if (assignees.length === 0) return "Asignar";
    if (assignees.length === 1) {
      const m = members.find((x) => x.id === assignees[0]);
      return m ? m.name : "1 asignado";
    }
    return `${assignees.length} asignados`;
  }, [isPersonalWorkspace, assignees, members]);

  return (
    <form onSubmit={onSubmit} className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative p-3 bg-card border border-border rounded-xl shadow-2xl transition-all focus-within:ring-1 focus-within:ring-white/20 focus-within:border-white/20">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-secondary rounded-lg text-muted-foreground shrink-0">
            <Plus className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground/50 h-10"
          />
        </div>

        <div className="mt-3 flex items-center gap-3 flex-wrap">
          {/* PRIORITY */}
          <div className="relative flex items-center rounded-full bg-secondary/60 px-1 py-1 min-w-[10rem] flex-1 max-w-xs">
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

          {/* DUE DATE */}
          <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/60 border border-border/40 hover:border-border transition-all text-sm font-medium text-foreground/80 hover:text-foreground shrink-0"
              >
                <CalendarIcon className="w-4 h-4" />
                <span>{getDateButtonText()}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="start">
              <div className="flex flex-col">
                <div className="p-2 border-b border-border space-y-1">
                  <button
                    type="button"
                    onClick={() => setDueDateOption("today")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      dueDateOption === "today"
                        ? "bg-primary text-primary-foreground font-medium"
                        : "hover:bg-secondary"
                    }`}
                  >
                    Hoy
                  </button>

                  <button
                    type="button"
                    onClick={() => setDueDateOption("week")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      dueDateOption === "week"
                        ? "bg-primary text-primary-foreground font-medium"
                        : "hover:bg-secondary"
                    }`}
                  >
                    1 Semana
                  </button>

                  <button
                    type="button"
                    onClick={() => setDueDateOption("custom")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      dueDateOption === "custom"
                        ? "bg-primary text-primary-foreground font-medium"
                        : "hover:bg-secondary"
                    }`}
                  >
                    Elige el día
                  </button>
                </div>

                {dueDateOption === "custom" && (
                  <div className="p-3">
                    <Calendar
                      mode="single"
                      // 👇 lo que se ve seleccionado en el calendario
                      selected={customDate}
                      onSelect={handleCustomDateSelect}
                      disabled={(date: Date) =>
                        startOfDay(date) < startOfDay(new Date())
                      }
                      initialFocus
                      className="rounded-md border-0"
                      locale={es}
                    />
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* ASSIGNEES */}
          {!isPersonalWorkspace && (
            <Popover
              open={isAssignPopoverOpen}
              onOpenChange={setIsAssignPopoverOpen}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/60 border border-border/40 hover:border-border transition-all text-sm font-medium text-foreground/80 hover:text-foreground shrink-0"
                >
                  <Users className="w-4 h-4" />
                  <span>{assigneeLabel}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
              </PopoverTrigger>

              <PopoverContent className="w-72 p-2" align="start">
                <div className="px-2 py-1 text-xs text-muted-foreground">
                  Asignar a:
                </div>

                <div className="max-h-56 overflow-auto">
                  {members.map((m) => {
                    const checked = assignees.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleAssignee(m.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                          checked
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-secondary"
                        }`}
                      >
                        <span className="truncate">{m.name}</span>
                        {checked && (
                          <span className="text-xs font-semibold">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </form>
  );
}
