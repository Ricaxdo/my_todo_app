import { Plus } from "lucide-react";
import React from "react";

type Props = {
  newTask: string;
  setNewTask: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export default function AddTaskForm({ newTask, setNewTask, onSubmit }: Props) {
  return (
    <form onSubmit={onSubmit} className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative flex items-center gap-3 p-2 bg-card border border-border rounded-xl shadow-2xl transition-all focus-within:ring-1 focus-within:ring-white/20 focus-within:border-white/20">
        <div className="p-3 bg-secondary rounded-lg text-muted-foreground">
          <Plus className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground/50 h-10"
        />
        <button
          type="submit"
          disabled={!newTask.trim()}
          className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm opacity-0 focus-within:opacity-100 hover:opacity-100 transition-all disabled:opacity-0 disabled:pointer-events-none"
        >
          Add Task <span className="text-xs opacity-50">↵</span>
        </button>
      </div>
    </form>
  );
}
