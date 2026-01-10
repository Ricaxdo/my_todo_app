"use client";

import type { Task } from "@/types/types";
import { LayoutGrid } from "lucide-react";

import { taskIdOf } from "@/components/todo-dashboard/mappers/todoMapper";
import TaskItem from "../task-item/TaskItem";
import { useNow } from "./hooks/useNow";

type MemberLite = {
  id: string; // userId real
  name: string;
  lastName?: string;
  isYou?: boolean;
};

type Props = {
  tasks: Task[];
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;

  members?: MemberLite[];
  isPersonalWorkspace?: boolean;
  meId?: string | null;
};

/**
 * Orden:
 * 1) incompletas primero
 * 2) completadas al final
 * 3) dentro de cada grupo: por createdAt ASC (más viejas arriba)
 */
function sortTasks(tasks: Task[]): Task[] {
  const sortByCreatedAtAsc = (a: Task, b: Task) => {
    const dateA =
      a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
    const dateB =
      b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
    return dateA.getTime() - dateB.getTime();
  };

  const incomplete = tasks.filter((t) => !t.completed).sort(sortByCreatedAtAsc);
  const complete = tasks.filter((t) => t.completed).sort(sortByCreatedAtAsc);

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
  // "now" se calcula FUERA de TaskItem (un solo timer para toda la lista)
  // - cada 60s es suficiente para overdue, y es barato
  const now = useNow(60_000);

  // ordenamos la lista con reglas claras
  const sortedTasks = sortTasks(tasks);

  // empty state primero (evita map innecesario)
  if (sortedTasks.length === 0) {
    return (
      <div className="space-y-2 min-h-[300px]">
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
          <LayoutGrid className="w-10 h-10 mb-4 opacity-20" />
          <p>No tasks found in this view</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 min-h-[300px]">
      {sortedTasks.map((task) => {
        const id = taskIdOf(task);

        return (
          <TaskItem
            key={id}
            task={task}
            now={now} // overdue se calcula dentro del item SIN Date.now
            onToggle={() => toggleTask(id)}
            onDelete={() => deleteTask(id)}
            members={members}
            isPersonalWorkspace={isPersonalWorkspace}
            meId={meId}
          />
        );
      })}
    </div>
  );
}
