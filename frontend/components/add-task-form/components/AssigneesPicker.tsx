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
  members: Member[];
  asg: {
    isAssignPopoverOpen: boolean;
    setIsAssignPopoverOpen: (v: boolean) => void;

    isAllSelected: boolean;
    toggleAll: () => void;
    toggleAssignee: (id: string) => void;

    assigneeLabel: string;

    isSelected: (id: string) => boolean;
  };
};

function firstNameOnly(s: string) {
  return s.trim().split(/\s+/)[0] ?? "";
}

function compactAssigneeLabel(label: string) {
  // Si es "Todos", lo dejamos igual
  if (label.toLowerCase() === "todos") return "Todos";

  // Puede venir tipo "Ricardo, Juan" / "Ricardo +2" / "Ricardo y 2 más"
  // Nos quedamos con el primer token “humano”
  const firstChunk = label.split(/[,+]/)[0] ?? label; // antes de coma o '+'
  return firstNameOnly(firstChunk);
}

/**
 * Selector de asignados para workspaces compartidos.
 * - Si solo hay 1 miembro (el creador), el trigger se deshabilita y solo muestra su nombre.
 * - Pinta estado seleccionado por miembro (highlight + ✓).
 */
export default function AssigneesPicker({ members, asg }: Props) {
  const {
    isAssignPopoverOpen,
    setIsAssignPopoverOpen,
    isAllSelected,
    toggleAll,
    toggleAssignee,
    assigneeLabel,
    isSelected,
  } = asg;

  const onlyOneMember = members.length === 1;

  const singleMemberName = onlyOneMember
    ? toTitleCase(members[0]?.name ?? "")
    : "";

  // Si solo hay 1 miembro, evitamos que el popover pueda abrirse.
  const popoverOpen = onlyOneMember ? false : isAssignPopoverOpen;
  const handleOpenChange = (v: boolean) => {
    if (onlyOneMember) return;
    setIsAssignPopoverOpen(v);
  };

  // Label: si solo está el creador, mostramos su nombre sí o sí.
  const label = onlyOneMember ? singleMemberName : assigneeLabel;

  const labelFull = onlyOneMember ? singleMemberName : assigneeLabel;
  const labelMobile = onlyOneMember
    ? firstNameOnly(singleMemberName)
    : compactAssigneeLabel(assigneeLabel);

  return (
    <Popover open={popoverOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={onlyOneMember}
          className={[
            "flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/60 border border-border/40 text-sm max-[349px]:text-xs font-medium shrink-0",
            onlyOneMember
              ? "opacity-60 cursor-not-allowed"
              : "hover:border-border transition-all text-foreground/80 hover:text-foreground",
          ].join(" ")}
          title={
            onlyOneMember ? "Solo hay un miembro en este workspace" : undefined
          }
        >
          <Users className="w-4 h-4" />

          {/* >=800px: label completo */}
          <span className="max-w-[160px] truncate hidden min-[880px]:inline">
            {labelFull}
          </span>

          {/* <800px: solo primer nombre */}
          <span className="max-w-[120px] truncate inline min-[880px]:hidden">
            {labelMobile}
          </span>

          {/* Si está disabled, ocultamos el chevron */}
          {!onlyOneMember && <ChevronDown className="w-3 h-3 opacity-60" />}
        </button>
      </PopoverTrigger>

      {/* Si solo hay 1 miembro, ni renderizamos contenido */}
      {!onlyOneMember && (
        <PopoverContent className="w-72 p-2" align="start">
          <div className="px-2 py-1 text-xs text-muted-foreground">
            Asignar a:
          </div>

          {/* Opción global: Todos */}
          <button
            type="button"
            onClick={toggleAll}
            className={[
              "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
              isAllSelected ? "bg-white/80 text-black" : "hover:bg-secondary",
            ].join(" ")}
          >
            <span>Todos</span>
            {isAllSelected && <span className="text-xs font-semibold">✓</span>}
          </button>

          <div className="my-1 h-px bg-border" />

          {/* Lista de miembros */}
          <div className="max-h-56 overflow-auto">
            {members.map((m) => {
              const selected = isSelected(m.id);

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleAssignee(m.id)}
                  className={[
                    "w-full flex items-center justify-between my-1 px-3 py-2 rounded-md text-sm transition-colors",
                    selected ? "bg-white/80 text-black" : "hover:bg-secondary",
                  ].join(" ")}
                >
                  <span className="truncate">{toTitleCase(m.name)}</span>
                  {selected && <span className="text-xs font-semibold">✓</span>}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
}
