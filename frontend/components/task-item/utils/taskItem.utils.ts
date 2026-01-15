import type { Task } from "@/types/types";
import type { AssigneeMember } from "../types/taskItem.types";

export function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const d = new Date(value as string | number);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function getPriorityMeta(priority: Task["priority"]) {
  const label =
    priority === "low" ? "Low" : priority === "medium" ? "Medium" : "High";

  const classes =
    priority === "low"
      ? "text-blue-400 bg-blue-500/10 border-blue-500/30"
      : priority === "medium"
      ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
      : "text-red-400 bg-red-500/10 border-red-500/30";

  const iconColor =
    priority === "low"
      ? "text-blue-400"
      : priority === "medium"
      ? "text-amber-400"
      : "text-red-400";

  return { label, classes, iconColor };
}

/** Title Case simple (soporta acentos). */
export function toTitleCase(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");
}

function firstName(name: string) {
  return (name ?? "").trim().split(/\s+/)[0] ?? "";
}

/**
 * Devuelve el label que se muestra en la pill de asignación.
 * Reglas:
 * - Workspace compartido: si están todos => "Todos"
 * - Personal: si incluye meId => "Tú"
 * - 1 asignado => "Juan"
 * - 2 asignados => "Juan y Pedro"
 * - 3+ asignados => "Juan +2"
 * - Si no resolvemos nombres => "Asignado"
 */
export function getAssigneeLabel(params: {
  assigneeIds: string[] | undefined;
  members?: AssigneeMember[];
  isPersonalWorkspace?: boolean;
  meId?: string | null;
}) {
  const { assigneeIds, members = [], isPersonalWorkspace, meId } = params;

  const ids = Array.isArray(assigneeIds) ? assigneeIds : [];
  if (ids.length === 0) return null;

  // 1) "Todos" (solo en shared)
  if (!isPersonalWorkspace) {
    const allIds = new Set<string>(members.map((m) => m.id));
    if (meId) allIds.add(meId);

    const isAll =
      allIds.size > 0 && Array.from(allIds).every((id) => ids.includes(id));

    if (isAll) return "Todos";
  }

  // 2) Personal: si te incluye a ti, es "Tú"
  if (isPersonalWorkspace && meId && ids.includes(meId)) {
    return "Tú";
  }

  // 3) Resolver nombres en el orden de ids (y sin duplicados)
  const seen = new Set<string>();
  const resolved = ids
    .filter((id) => {
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .map((id) => members.find((m) => m.id === id))
    .filter((m): m is AssigneeMember => Boolean(m));

  if (resolved.length === 0) return "Asignado";

  // Si por algún motivo viene el "yo" como member.isYou en shared, lo mostramos como Tú
  const names = resolved.map((m) =>
    m.isYou ? "Tú" : toTitleCase(firstName(m.name))
  );

  // 4) Formato según cantidad
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} y ${names[1]}`;

  return `${names[0]} +${names.length - 1}`;
}
