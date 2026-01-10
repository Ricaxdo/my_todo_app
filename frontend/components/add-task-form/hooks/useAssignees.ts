import { useEffect, useMemo, useState } from "react";
import type { Member } from "../types/addTaskForm.types";
import { toTitleCase } from "../utils/addTaskForm.utils";

export function useAssignees(params: {
  isPersonalWorkspace: boolean;
  meId: string;
  members: Member[];
  assignees: string[];
  setAssignees: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const { isPersonalWorkspace, meId, members, assignees, setAssignees } =
    params;
  const [isAssignPopoverOpen, setIsAssignPopoverOpen] = useState(false);

  // ✅ personal: siempre asignado a mí
  useEffect(() => {
    if (!isPersonalWorkspace) return;
    if (assignees.length !== 1 || assignees[0] !== meId) setAssignees([meId]);
  }, [isPersonalWorkspace, meId, assignees, setAssignees]);

  const allAssigneeIds = useMemo(() => {
    const ids = new Set<string>();
    for (const m of members) ids.add(m.id);
    if (meId) ids.add(meId);
    return Array.from(ids);
  }, [members, meId]);

  const isAllSelected = useMemo(() => {
    if (isPersonalWorkspace) return false;
    if (allAssigneeIds.length === 0) return false;
    return allAssigneeIds.every((id) => assignees.includes(id));
  }, [isPersonalWorkspace, allAssigneeIds, assignees]);

  const toggleAll = () => {
    if (isPersonalWorkspace) return;
    setAssignees(isAllSelected ? [meId] : allAssigneeIds);
  };

  const toggleAssignee = (id: string) => {
    if (isPersonalWorkspace) return;

    setAssignees((prev) => {
      // Si estaba "Todos", al tocar uno se rompe "Todos" y se quita ese id
      if (isAllSelected) {
        const next = allAssigneeIds.filter((x) => x !== id);
        return next.length ? next : [meId];
      }

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
