// src/features/todo/types/types.ts
export type Priority = "low" | "medium" | "high";

export interface BackendTask {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  category: string;
  createdAt: string;
  updatedAt?: string; // opcional, igual que en el backend
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  category: string;
  createdAt: Date;
  updatedAt?: Date;
  assignees?: string[];
}
