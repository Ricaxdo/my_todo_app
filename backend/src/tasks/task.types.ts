export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  category: string;
  createdAt: string; // ISO
  updatedAt?: string; // OPCIONAL (no la pongas nunca explícitamente como undefined)
}
