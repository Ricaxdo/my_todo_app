import { useEffect, useMemo, useState } from "react";
import type { Member } from "../types/addTaskForm.types";
import { toTitleCase } from "../utils/addTaskForm.utils";

/**
 * Hook para manejar la lógica de asignación de tareas.
 * Encapsula reglas de negocio entre workspaces personales y compartidos.
 */
export function useAssignees(params: {
  isPersonalWorkspace: boolean;
  meId: string;
  members: Member[];
  assignees: string[];
  setAssignees: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const { isPersonalWorkspace, meId, members, assignees, setAssignees } =
    params;

  /** Estado de UI: popover de asignación */
  const [isAssignPopoverOpen, setIsAssignPopoverOpen] = useState(false);

  /**
   * Regla de negocio:
   * En workspace personal la tarea SIEMPRE está asignada al usuario actual.
   * Se fuerza incluso si alguien intenta cambiarlo manualmente.
   */
  useEffect(() => {
    if (!isPersonalWorkspace) return;

    if (assignees.length !== 1 || assignees[0] !== meId) {
      setAssignees([meId]);
    }
  }, [isPersonalWorkspace, meId, assignees, setAssignees]);

  /**
   * Lista única de IDs asignables:
   * - miembros del workspace
   * - el usuario actual (por seguridad)
   */
  const allAssigneeIds = useMemo(() => {
    const ids = new Set<string>();
    for (const m of members) ids.add(m.id);
    if (meId) ids.add(meId);
    return Array.from(ids);
  }, [members, meId]);

  /**
   * Indica si el estado actual representa "Todos".
   * Solo aplica en workspaces compartidos.
   */
  const isAllSelected = useMemo(() => {
    if (isPersonalWorkspace) return false;
    if (allAssigneeIds.length === 0) return false;

    return allAssigneeIds.every((id) => assignees.includes(id));
  }, [isPersonalWorkspace, allAssigneeIds, assignees]);

  /**
   * Toggle global:
   * - Si ya están todos → vuelve al usuario actual
   * - Si no → asigna a todos
   */
  const toggleAll = () => {
    if (isPersonalWorkspace) return;
    setAssignees(isAllSelected ? [meId] : allAssigneeIds);
  };

  /**
   * Toggle individual de asignado.
   * Maneja correctamente el caso "Todos" y evita estados vacíos.
   */
  const toggleAssignee = (id: string) => {
    if (isPersonalWorkspace) return;

    setAssignees((prev) => {
      // Si estaba "Todos", se rompe el estado y se quita el seleccionado
      if (isAllSelected) {
        const next = allAssigneeIds.filter((x) => x !== id);
        return next.length ? next : [meId];
      }

      // Si ya estaba seleccionado, se elimina
      if (prev.includes(id)) {
        const next = prev.filter((x) => x !== id);
        return next.length ? next : [meId];
      }

      // Si no estaba, se agrega
      return [...prev, id];
    });
  };

  /**
   * Label humano para UI:
   * - Personal → "Asignado a mí"
   * - Todos → "Todos"
   * - Uno → nombre
   * - Varios → "N asignados"
   */
  const assigneeLabel = useMemo(() => {
    if (isPersonalWorkspace) return "Asignado a mí";
    if (assignees.length === 0) return "Asignar";
    if (isAllSelected) return "Todos";

    if (assignees.length === 1) {
      const m = members.find((x) => x.id === assignees[0]);
      return m ? toTitleCase(m.name) : "1 asignado";
    }

    return `${assignees.length} asignados`;
  }, [isPersonalWorkspace, assignees, members, isAllSelected]);

  return {
    isAssignPopoverOpen,
    setIsAssignPopoverOpen,
    allAssigneeIds,
    isAllSelected,
    toggleAll,
    toggleAssignee,
    assigneeLabel,
  };
}
