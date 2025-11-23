// app/todo/types.ts
export type Priority = "low" | "medium" | "high";

export interface Task {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
  priority: Priority;
  category: string;
}

export type BackendTask = Omit<Task, "createdAt"> & {
  createdAt: string; // ISO desde la API
};
