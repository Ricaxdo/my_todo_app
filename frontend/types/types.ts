// src/features/todo/types/types.ts
export type Priority = "low" | "medium" | "high";

export interface BackendTask {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  category: string;
  createdAt: string;
  updatedAt?: string;
  dueDate?: string | null; // ✅ AÑADIR
  assignees: string[];
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  category: string;
  createdAt: Date;
  updatedAt?: Date;
  dueDate?: Date | null; // ✅ AÑADIR
  assignees?: string[];
}
