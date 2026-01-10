"use client";

import { Plus } from "lucide-react";

import { useAssignees } from "./hooks/useAssignees";
import { useDueDate } from "./hooks/useDueDate";
import type { AddTaskFormProps } from "./types/addTaskForm.types";
import { prioritySliderPosition } from "./utils/addTaskForm.utils";

import AssigneesPicker from "./components/AssigneesPicker";
import DueDatePicker from "./components/DueDatePicker";
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
    <form onSubmit={onSubmit} className="relative group">
      {/* Glow decorativo en hover (no afecta layout) */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Card del form: mejora UX con focus-within para resaltar al escribir */}
      <div className="relative p-3 bg-card border border-border rounded-xl shadow-2xl transition-all focus-within:ring-1 focus-within:ring-white/20 focus-within:border-white/20">
        {/* Input principal: título/descripcion corta de la tarea */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-secondary rounded-lg text-muted-foreground shrink-0">
            <Plus className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Crea una nueva tarea"
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground/50 h-10"
          />
        </div>

        {/* Controles secundarios: prioridad / vencimiento / asignados */}
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <PrioritySwitch
            priority={priority}
            setPriority={setPriority}
            sliderPosition={sliderPosition}
          />

          <DueDatePicker due={due} />

          {/* Regla de negocio en UI:
              En workspace personal NO se muestran asignados (siempre soy yo). */}
          {!isPersonalWorkspace && (
            <AssigneesPicker members={members} asg={asg} />
          )}
        </div>
      </div>
    </form>
  );
}
