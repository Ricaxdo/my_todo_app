// src/features/todo/useTodoDashboard.ts
"use client";

import type React from "react";
import { useEffect, useState } from "react";
import type { BackendTask, Task } from "../types/types";

const API_URL = "http://localhost:4000";

type Filter = "all" | "active" | "completed";

export function useTodoDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("all");

  // 1) Cargar tareas desde el backend al montar el componente
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`${API_URL}/todos`);
        const data: BackendTask[] = await res.json();

        const normalized: Task[] = data.map((t) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          updatedAt: t.updatedAt ? new Date(t.updatedAt) : undefined,
        }));

        setTasks(normalized);
      } catch (err) {
        console.error("[frontend] Error al cargar tareas:", err);
      }
    };

    fetchTasks();
  }, []);

  // 2) Crear una nueva tarea en el backend
  const handleAddTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const res = await fetch(`${API_URL}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: newTask,
          priority: "medium",
          category: "General",
        }),
      });

      if (!res.ok) {
        console.error("[frontend] Error al crear tarea");
        return;
      }

      const created: BackendTask = await res.json();

      const task: Task = {
        ...created,
        createdAt: new Date(created.createdAt),
        updatedAt: created.updatedAt ? new Date(created.updatedAt) : undefined,
      };

      setTasks((prev) => [task, ...prev]);
      setNewTask("");
    } catch (err) {
      console.error("[frontend] Error en handleAddTask:", err);
    }
  };

  // 3) Alternar completado (PUT /todos/:id)
  // antes: (id: number)
  const toggleTask = async (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    const updatedCompleted = !target.completed;

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: updatedCompleted } : t))
    );

    try {
      await fetch(`${API_URL}/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: updatedCompleted }),
      });
    } catch (err) {
      console.error("[frontend] Error al actualizar tarea:", err);
    }
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      await fetch(`${API_URL}/todos/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("[frontend] Error al borrar tarea:", err);
    }
  };

  // Métricas
  const completedCount = tasks.filter((t) => t.completed).length;
  const activeCount = tasks.filter((t) => !t.completed).length;
  const completionRate =
    tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Filtro
  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === "active") return !task.completed;
    if (activeFilter === "completed") return task.completed;
    return true;
  });

  return {
    // state
    tasks,
    newTask,
    activeFilter,
    // setters
    setNewTask,
    setActiveFilter,
    // actions
    handleAddTask,
    toggleTask,
    deleteTask,
    // derivados
    filteredTasks,
    completedCount,
    activeCount,
    completionRate,
  };
}
