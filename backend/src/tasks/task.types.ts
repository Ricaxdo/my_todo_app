// src/tasks/task.types.ts
export type Priority = "high" | "medium" | "low";

export interface Task {
  id: number;
  text: string;
  completed: boolean;
  priority: Priority;
  category: string;
  createdAt: string; // ISO string
}
