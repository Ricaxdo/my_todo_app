import { LayoutGrid } from "lucide-react";
import type { Task } from "../app/types/types";
import TaskItem from "./TaskItem";

type AssigneeMember = {
  userId: string;
  name: string;
  lastName?: string;
  isYou?: boolean;
};

type Props = {
  tasks: Task[];
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;

  members?: AssigneeMember[];
  isPersonalWorkspace?: boolean;
  meId?: string | null;
};

export default function TaskList({
  tasks,
  toggleTask,
  deleteTask,
  members,
  isPersonalWorkspace,
  meId,
}: Props) {
  return (
    <div className="space-y-2 min-h-[300px]">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={() => toggleTask(task.id)}
          onDelete={() => deleteTask(task.id)}
          // ✅ PASARLOS
          members={members}
          isPersonalWorkspace={isPersonalWorkspace}
          meId={meId}
        />
      ))}

      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
          <LayoutGrid className="w-10 h-10 mb-4 opacity-20" />
          <p>No tasks found in this view</p>
        </div>
      )}
    </div>
  );
}
