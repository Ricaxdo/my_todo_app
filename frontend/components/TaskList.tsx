import { LayoutGrid } from "lucide-react";
import type { Task } from "../app/types/types"; // ajusta el path si hace falta
import TaskItem from "./TaskItem";

type Props = {
  tasks: Task[];
  toggleTask: (id: string) => void; // 🔁 string
  deleteTask: (id: string) => void; // 🔁 string
};

export default function TaskList({ tasks, toggleTask, deleteTask }: Props) {
  return (
    <div className="space-y-2 min-h-[300px]">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={() => toggleTask(task.id)} // ok: task.id es string
          onDelete={() => deleteTask(task.id)} // ok: task.id es string
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
