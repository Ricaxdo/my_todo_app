import type { ActivityItem } from "@/types/activity.types";

function fullName(actor: ActivityItem["actor"]) {
  return actor.lastName ? `${actor.name} ${actor.lastName}` : actor.name;
}

export function formatActivity(a: ActivityItem): string {
  const who = fullName(a.actor);
  const meta = a.meta ?? {};

  switch (a.type) {
    case "todo.create":
      return `${who} creó una tarea`;

    case "todo.toggle":
      if (typeof meta.from === "boolean" && typeof meta.to === "boolean") {
        return meta.to
          ? `${who} completó una tarea`
          : `${who} reabrió una tarea`;
      }
      return `${who} actualizó una tarea`;

    case "todo.delete":
      return `${who} eliminó una tarea`;

    case "todo.bulk_create":
      return `${who} creó múltiples tareas`;

    case "todo.bulk_complete":
      return `${who} completó varias tareas`;

    case "todo.bulk_delete":
      return `${who} eliminó varias tareas`;

    case "workspace.join":
      return `${who} se unió al workspace`;

    case "workspace.leave":
      return `${who} salió del workspace`;

    case "workspace.delete":
      return `${who} eliminó el workspace`;

    case "member.remove":
      return `${who} removió a un miembro`;

    default:
      return `${who} realizó una acción`;
  }
}
