"use client";

import { Plus } from "lucide-react";

import { useAssignees } from "./hooks/useAssignees";
import { useDueDate } from "./hooks/useDueDate";
import type { AddTaskFormProps } from "./types/addTaskForm.types";
import { prioritySliderPosition } from "./utils/addTaskForm.utils";

import AssigneesPicker from "./components/AssigneesPicker";
import PrioritySwitch from "./components/PrioritySwitch";

/**
 * AddTaskForm (presentational + orchestration):
 * - Renderiza el formulario y compone controles.
 * - La lógica de negocio vive en hooks (useDueDate / useAssignees).
 * - Componente controlado: el estado principal llega por props.
 */
export default function AddTaskForm(props: AddTaskFormProps) {
  const {
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
  } = props;

  /** Hook de vencimiento: presets (hoy/semana) + fecha custom + popover state */
  const due = useDueDate({ dueDate, setDueDate });

  /**
   * Hook de asignados:
   * - Personal workspace: fuerza "asignado a mí"
   * - Shared workspace: permite multi-selección y "Todos"
   */
  const asg = useAssignees({
    isPersonalWorkspace,
    meId,
    members,
    assignees,
    setAssignees,
  });

  /** Posición del slider (UI) derivada de la prioridad */
  const sliderPosition = prioritySliderPosition(priority);

  return (
    <form onSubmit={onSubmit} className="relative">
      {/* Halo suave (no invade, no “pulse”) */}
      <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-primary/12 blur-3xl opacity-60" />

      {/* Card principal (zona protagonista) */}
      <div
        className="
        relative overflow-hidden rounded-2xl
        border border-border/60
        bg-card/85 backdrop-blur supports-[backdrop-filter]:bg-card/70
        shadow-[0_18px_55px_-45px_rgba(0,0,0,0.55)]
        ring-1 ring-border/40
        transition
        focus-within:border-primary/25
      "
      >
        {/* Hairline superior sutil */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="p-4 sm:p-5">
          {/* Input principal */}
          <div className="flex items-center gap-3">
            <div className="shrink-0 rounded-xl bg-secondary/80 p-3 text-muted-foreground ring-1 ring-border/40">
              <Plus className="h-5 w-5" />
            </div>

            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="¿Qué quieres lograr hoy?"
              className="
               min-w-0 bg-transparent border-none outline-none
              text-[17px] sm:text-lg
              placeholder:text-muted-foreground/60
              h-11
            "
            />
          </div>

          {/* Controles secundarios */}
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <PrioritySwitch
              priority={priority}
              setPriority={setPriority}
              sliderPosition={sliderPosition}
            />

            {!isPersonalWorkspace && (
              <AssigneesPicker members={members} asg={asg} />
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
