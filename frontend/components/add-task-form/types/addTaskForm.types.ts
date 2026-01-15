import type { Priority } from "@/types/types";
import type React from "react";

export type DueDateOption = "today" | "week" | "custom";
export type Member = { id: string; name: string };

export type AddTaskFormProps = {
  newTask: string;
  setNewTask: (value: string) => void;

  priority: Priority;
  setPriority: (value: Priority) => void;

  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;

  dueDate: Date;
  setDueDate: (date: Date) => void;

  isPersonalWorkspace: boolean;
  meId: string;
  members: Member[];

  assignees: string[];
  setAssignees: React.Dispatch<React.SetStateAction<string[]>>;
};
