// src/tasks/task.store.ts
import type { Priority, Task } from "./task.types";

let tasks: Task[] = [
  {
    id: 1,
    text: "Primera tarea del backend",
    completed: false,
    priority: "medium",
    category: "General",
    createdAt: new Date().toISOString(),
  },
];

let nextId = 2;

export function getAllTasks(): Task[] {
  return tasks;
}

export function createTask(input: {
  text: string;
  priority?: Priority;
  category?: string;
}): Task {
  const newTask: Task = {
    id: nextId++,
    text: input.text,
    completed: false,
    priority: input.priority ?? "medium",
    category: input.category ?? "General",
    createdAt: new Date().toISOString(),
  };

  tasks.push(newTask);
  return newTask;
}

/**
 * Actualiza SOLO campos mutables. No permite tocar `id` ni `createdAt`.
 */
export function updateTask(
  id: number,
  data: Partial<Omit<Task, "id" | "createdAt">>
): Task | null {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const current = tasks[index];
  if (!current) return null; // por noUncheckedIndexedAccess

  // Clonamos el actual y vamos sobreescribiendo campos permitidos
  const updated = { ...current };

  if (data.text !== undefined) {
    updated.text = data.text;
  }
  if (data.priority !== undefined) {
    updated.priority = data.priority;
  }
  if (data.category !== undefined) {
    updated.category = data.category;
  }
  if (data.completed !== undefined) {
    updated.completed = data.completed;
  }

  // id y createdAt nunca se tocan
  tasks[index] = updated;
  return updated;
}

export function deleteTask(id: number): boolean {
  const before = tasks.length;
  tasks = tasks.filter((t) => t.id !== id);
  return tasks.length < before;
}
