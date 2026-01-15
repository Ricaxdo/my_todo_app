"use client";

import { Plus } from "lucide-react";

import { useAssignees } from "./hooks/useAssignees";
import type { AddTaskFormProps } from "./types/addTaskForm.types";
import { prioritySliderPosition } from "./utils/addTaskForm.utils";

import AssigneesPicker from "./components/AssigneesPicker";
import PrioritySwitch from "./components/PrioritySwitch";

export default function AddTaskForm(props: AddTaskFormProps) {
  const {
    newTask,
    setNewTask,
    priority,
    setPriority,
    onSubmit,
    isPersonalWorkspace,
    meId,
    members,
    assignees,
    setAssignees,
  } = props;

  const asg = useAssignees({
    isPersonalWorkspace,
    meId,
    members,
    assignees,
    setAssignees,
  });

  const sliderPosition = prioritySliderPosition(priority);

  return (
    <form onSubmit={onSubmit} className="relative">
      {/* Halo suave */}
      <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-primary/12 blur-3xl opacity-60" />

      {/* Card principal */}
      <div
        className="
          group relative overflow-hidden rounded-2xl
          border border-border/60
          bg-card/85 backdrop-blur supports-[backdrop-filter]:bg-card/70
          shadow-[0_18px_55px_-45px_rgba(0,0,0,0.55)]
          ring-1 ring-border/40

          transition-all duration-200
          motion-reduce:transition-none

          hover:-translate-y-[1px]
          hover:border-border/80
          hover:ring-border/60
          hover:shadow-[0_22px_65px_-48px_rgba(0,0,0,0.62)]

          focus-within:-translate-y-[1px]
          focus-within:border-primary/35
          focus-within:ring-2 focus-within:ring-primary/25
        "
      >
        {/* Hairline superior */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        {/* Sheen sutil al hover/focus */}
        <div
          className="
            pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200
            bg-[radial-gradient(900px_circle_at_20%_0%,rgba(255,255,255,0.10),transparent_55%)]
            group-hover:opacity-100 group-focus-within:opacity-100
          "
        />

        <div className="relative p-4 sm:p-5">
          {/* Input principal */}
          <div className="flex items-center gap-3">
            <div
              className="
                shrink-0 rounded-xl p-3
                bg-secondary/80 text-muted-foreground
                ring-1 ring-border/40

                transition-all duration-200
                group-hover:bg-secondary
                group-hover:text-foreground/80
                group-hover:ring-border/60

                group-focus-within:bg-primary/10
                group-focus-within:text-primary
                group-focus-within:ring-primary/25
              "
            >
              <Plus className="h-5 w-5 transition-transform duration-200 group-hover:scale-[1.03] group-active:scale-[0.98]" />
            </div>

            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="¿Qué quieres lograr hoy?"
              className="
                min-w-0 flex-1 bg-transparent border-none outline-none
                text-[17px] sm:text-lg
                h-11

                placeholder:text-muted-foreground/60
                transition-[color,opacity,transform] duration-200

                focus-visible:placeholder:text-muted-foreground/45
                focus-visible:translate-x-[1px]

                focus-visible:ring-2 focus-visible:ring-primary/25
                focus-visible:ring-offset-0
                rounded-lg px-2 -ml-2
              "
            />
          </div>

          {/* Controles secundarios */}
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <div
              className="
                transition-transform duration-200
                group-hover:translate-y-0
                group-active:translate-y-[1px]
              "
            >
              <PrioritySwitch
                priority={priority}
                setPriority={setPriority}
                sliderPosition={sliderPosition}
              />
            </div>

            {!isPersonalWorkspace && (
              <div
                className="
                  transition-transform duration-200
                  group-hover:translate-y-0
                  group-active:translate-y-[1px]
                "
              >
                <AssigneesPicker members={members} asg={asg} />
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
