"use client";

import { useState } from "react";

import {
  Calendar,
  Check,
  Clock,
  LayoutGrid,
  ListTodo,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import type React from "react";

/**
 * Tipos de datos para nuestras tareas
 */
type Priority = "low" | "medium" | "high";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  priority: Priority;
  category: string;
}

export default function TodoDashboard() {
  // Estado principal de las tareas
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      text: "Review design system updates",
      completed: false,
      createdAt: new Date(),
      priority: "high",
      category: "Design",
    },
    {
      id: "2",
      text: "Prepare presentation deck",
      completed: true,
      createdAt: new Date(),
      priority: "medium",
      category: "Work",
    },
    {
      id: "3",
      text: "Update client documentation",
      completed: false,
      createdAt: new Date(),
      priority: "low",
      category: "Docs",
    },
  ]);

  // Estado para el input de nueva tarea
  const [newTask, setNewTask] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "completed"
  >("all");

  /**
   * Maneja la adición de nuevas tareas
   */
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const task: Task = {
      id: Math.random().toString(36).substring(2),
      text: newTask,
      completed: false,
      createdAt: new Date(),
      priority: "medium",
      category: "General",
    };

    setTasks([task, ...tasks]);
    setNewTask("");
  };

  /**
   * Alterna el estado de completado de una tarea
   */
  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  /**
   * Elimina una tarea
   */
  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  // Métricas calculadas
  const completedCount = tasks.filter((t) => t.completed).length;
  const activeCount = tasks.filter((t) => !t.completed).length;
  const completionRate =
    tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Tareas filtradas para renderizar
  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === "active") return !task.completed;
    if (activeFilter === "completed") return task.completed;
    return true;
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Fondo de grilla sutil */}
      <div className="fixed inset-0 bg-grid-white pointer-events-none opacity-[0.05]" />

      <div className="relative max-w-5xl mx-auto p-6 space-y-12">
        {/* Header Section - Inspirado en Vercel */}
        <header className="pt-12 pb-8 space-y-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-border bg-secondary/50 text-xs font-medium text-muted-foreground mb-4">
            <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            v1.0.0 Public Beta
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Focus on <br /> what matters.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl font-light">
            Una herramienta minimalista diseñada para mantener tu flujo de
            trabajo limpio, organizado y eficiente.
          </p>
        </header>

        {/* Bento Grid Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-secondary text-primary">
                <ListTodo className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                PENDING
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-4xl font-bold tracking-tighter">
                {activeCount}
              </p>
              <p className="text-sm text-muted-foreground">
                Tasks waiting for you
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-secondary text-primary">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                EFFICIENCY
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-4xl font-bold tracking-tighter">
                {completionRate}%
              </p>
              <p className="text-sm text-muted-foreground">
                Completion rate today
              </p>
            </div>
            {/* Barra de progreso visual */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary">
              <div
                className="h-full bg-white transition-all duration-1000 ease-out"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-secondary text-primary">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                TODAY
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-medium tracking-tight">
                {new Date().toLocaleDateString("es-ES", {
                  weekday: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString("es-ES", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </section>

        {/* Main List Section */}
        <main className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
            <div className="flex items-center gap-2">
              {(["all", "active", "completed"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeFilter === filter
                      ? "bg-white text-black"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              <input
                type="text"
                placeholder="Search tasks..."
                className="bg-secondary/50 border-none rounded-full py-1.5 pl-9 pr-4 text-sm w-full md:w-64 focus:ring-1 focus:ring-white/20 transition-all"
              />
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-2 min-h-[300px]">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="group flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-secondary/50 hover:border-border transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    task.completed
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground/30 hover:border-primary group-hover:scale-110"
                  }`}
                >
                  {task.completed && <Check className="w-3.5 h-3.5" />}
                </button>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm md:text-base font-medium truncate transition-all ${
                      task.completed
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    }`}
                  >
                    {task.text}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground uppercase tracking-wider">
                      {task.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground/50">
                      {task.createdAt.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-red-400 transition-all transform translate-x-2 group-hover:translate-x-0"
                  aria-label="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {filteredTasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
                <LayoutGrid className="w-10 h-10 mb-4 opacity-20" />
                <p>No tasks found in this view</p>
              </div>
            )}
          </div>

          {/* Add Task Input */}
          <form onSubmit={handleAddTask} className="relative group">
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
        </main>

        {/* Footer Documentation */}
        <footer className="border-t border-border pt-8 text-sm text-muted-foreground space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-foreground font-medium mb-2">
                About this Project
              </h3>
              <p className="leading-relaxed max-w-md">
                Este ToDo list utiliza React y TypeScript con Tailwind CSS v4.
                Implementa un diseño de Bento Grid para las métricas y utiliza
                un estado local optimista para una respuesta instantánea.
              </p>
            </div>
            <div>
              <h3 className="text-foreground font-medium mb-2">Key Features</h3>
              <ul className="grid grid-cols-2 gap-2">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Optimistic UI
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  Dark Mode First
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Responsive Grid
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  TypeScript Strict
                </li>
              </ul>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
