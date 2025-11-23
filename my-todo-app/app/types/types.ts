// src/features/todo/types.ts

export type Priority = "low" | "medium" | "high";

export interface Task {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date; // en el estado lo guardamos como Date
  priority: Priority;
  category: string;
}

export type BackendTask = Omit<Task, "createdAt"> & {
  createdAt: string; // en la API viene como string (ISO)
};
