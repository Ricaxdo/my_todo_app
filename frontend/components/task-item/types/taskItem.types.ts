import type { Task } from "@/types/types";

export type AssigneeMember = {
  id: string;
  name: string;
  lastName?: string;
  isYou?: boolean;
};

export type TaskItemProps = {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;

  members?: AssigneeMember[];
  isPersonalWorkspace?: boolean;
  meId?: string | null;

  now: number;
};
