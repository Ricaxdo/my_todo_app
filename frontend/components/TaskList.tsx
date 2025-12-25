"use client";

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

function sortTasks(tasks: Task[]): Task[] {
  const incomplete = tasks.filter((task) => !task.completed);
  const complete = tasks.filter((task) => task.completed);

  const sortByDate = (a: Task, b: Task) => {
    const dateA =
      a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
    const dateB =
      b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
    return dateA.getTime() - dateB.getTime(); // Oldest first
  };

  incomplete.sort(sortByDate);
  complete.sort(sortByDate);

  return [...incomplete, ...complete];
}

export default function TaskList({
  tasks,
  toggleTask,
  deleteTask,
  members,
  isPersonalWorkspace,
  meId,
}: Props) {
  const sortedTasks = sortTasks(tasks);

  return (
    <div className="space-y-2 min-h-[300px]">
      {sortedTasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={() => toggleTask(task.id)}
          onDelete={() => deleteTask(task.id)}
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
