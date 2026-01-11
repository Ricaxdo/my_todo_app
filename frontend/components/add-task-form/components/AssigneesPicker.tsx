"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, Users } from "lucide-react";
import type { Member } from "../types/addTaskForm.types";
import { toTitleCase } from "../utils/addTaskForm.utils";

type Props = {
  /**
   * Miembros disponibles para asignar.
   * La lógica de selección vive en el hook (useAssignees).
   */
  members: Member[];

  /**
   * Estado y handlers derivados de useAssignees.
   * Este componente solo consume y renderiza UI.
   */
  asg: {
    isAssignPopoverOpen: boolean;
    setIsAssignPopoverOpen: (v: boolean) => void;
    isAllSelected: boolean;
    toggleAll: () => void;
    toggleAssignee: (id: string) => void;
    assigneeLabel: string;
  };
};

/**
 * Selector de asignados para workspaces compartidos.
 * Componente controlado: no guarda estado propio de negocio.
 */
export default function AssigneesPicker({ members, asg }: Props) {
  const {
    isAssignPopoverOpen,
    setIsAssignPopoverOpen,
    isAllSelected,
    toggleAll,
    toggleAssignee,
    assigneeLabel,
  } = asg;

  return (
    <Popover open={isAssignPopoverOpen} onOpenChange={setIsAssignPopoverOpen}>
      <PopoverTrigger asChild>
        {/* Trigger tipo chip con label humano */}
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/60 border border-border/40 hover:border-border transition-all text-sm max-[349px]:text-xs font-medium text-foreground/80 hover:text-foreground shrink-0"
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

        {/* Opción global: Todos */}
        <button
          type="button"
          onClick={toggleAll}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
            isAllSelected ? "bg-white/80 text-black" : "hover:bg-secondary"
          }`}
        >
          <span>Todos</span>
          {isAllSelected && <span className="text-xs font-semibold">✓</span>}
        </button>

        <div className="my-1 h-px bg-border" />

        {/* Lista de miembros */}
        <div className="max-h-56 overflow-auto">
          {members.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => toggleAssignee(m.id)}
              className="w-full flex items-center justify-between my-1 px-3 py-2 rounded-md text-sm transition-colors hover:bg-secondary"
            >
              <span className="truncate">{toTitleCase(m.name)}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
