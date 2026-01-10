import type { BackendTask, Task } from "@/types/types";

export function normalizeTasks(data: BackendTask[]): Task[] {
  return data.map((t) => ({
    ...t,
    createdAt: new Date(t.createdAt),
    updatedAt: t.updatedAt ? new Date(t.updatedAt) : undefined,
    dueDate: t.dueDate ? new Date(t.dueDate) : null,
  }));
}

export function taskIdOf(t: Task | BackendTask): string {
  // @ts-expect-error soporta ambos shapes
  return (t.id ?? t._id) as string;
}
