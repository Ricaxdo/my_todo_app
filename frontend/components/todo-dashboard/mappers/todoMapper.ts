import type { BackendTask, Task } from "@/types/types";

/**
 * Normaliza tareas provenientes del backend.
 *
 * Convierte campos de fecha (string) a objetos Date para que
 * el resto del frontend no tenga que preocuparse por formatos.
 *
 * 👉 Este mapper es el ÚNICO lugar donde se hace esta conversión.
 */
export function normalizeTasks(data: BackendTask[]): Task[] {
  return data.map((t) => ({
    ...t,
    createdAt: new Date(t.createdAt),
    updatedAt: t.updatedAt ? new Date(t.updatedAt) : undefined,
    dueDate: t.dueDate ? new Date(t.dueDate) : null,
  }));
}

/**
 * Obtiene el ID real de una tarea.
 *
 * Soporta ambos shapes:
 * - `id`   → usado por el frontend
 * - `_id`  → usado por MongoDB / backend
 *
 * Centralizar esto evita condicionales y hacks repartidos
 * por componentes y hooks.
 */
export function taskIdOf(t: Task | BackendTask): string {
  // @ts-expect-error: soporta ambos shapes (id / _id)
  return (t.id ?? t._id) as string;
}
