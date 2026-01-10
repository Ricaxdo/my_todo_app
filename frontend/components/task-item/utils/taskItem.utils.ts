import type { Task } from "@/types/types";
import type { AssigneeMember } from "../types/taskItem.types";

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

/** Convierte Date|string|number a Date. Devuelve null si es falsy. */
export function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const d = new Date(value as string | number);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function getPriorityMeta(priority: Task["priority"]) {
  const label = priority === "low" ? "Low" : priority === "medium" ? "Medium" : "High";

  const classes =
    priority === "low"
      ? "text-blue-400 bg-blue-500/10 border-blue-500/30"
      : priority === "medium"
      ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
      : "text-red-400 bg-red-500/10 border-red-500/30";

  const iconColor =
    priority === "low" ? "text-blue-400" : priority === "medium" ? "text-amber-400" : "text-red-400";

  return { label, classes, iconColor };
}

/**
 * Devuelve el label que se muestra en la pill de asignación.
 * Reglas:
 * - Workspace NO personal: si están seleccionados todos los ids (members + meId) => "Todos"
 * - Workspace personal: si incluye meId => "Tú"
 * - Si hay 1 asignado: usa primer nombre
 * - Si no hay match pero hay ids: "Asignado"
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

  // ✅ "Todos" (solo aplica en workspaces compartidos)
  if (!isPersonalWorkspace) {
    const allIds = new Set<string>(members.map((m) => m.id));
    if (meId) allIds.add(meId);

    const isAll = allIds.size > 0 && Array.from(allIds).every((id) => ids.includes(id));
    if (isAll) return "Todos";
  }

  // ✅ personal: si te incluye a ti, es "Tú"
  if (isPersonalWorkspace && meId && ids.includes(meId)) {
    return "Tú";
  }

  // ✅ toma el primer id que podamos resolver a un nombre
  const firstMatch = ids
    .map((id) => members.find((m) => m.id === id))
    .find(Boolean);

  if (!firstMatch) return "Asignado";

  if (firstMatch.isYou) return "Tú";

  const firstName = (firstMatch.name ?? "").trim().split(/\s+/)[0] ?? "";
  return firstName ? toTitleCase(firstName) : "Asignado";
}
