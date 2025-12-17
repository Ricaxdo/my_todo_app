"use client";

import type React from "react";
import { useEffect, useState } from "react";
import type { BackendTask, Priority, Task } from "../types/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Filter = "all" | "active" | "completed";

// Helper para comparar fechas (solo día, mes, año)
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function useTodoDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [priority, setPriority] = useState<Priority>("low");

  // 👇 NUEVO: fecha seleccionada
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // ================================
  // 1) Cargar tareas desde backend
  // ================================
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

  // ================================
  // 2) Crear nueva tarea
  // ================================
  const handleAddTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const res = await fetch(`${API_URL}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: newTask,
          priority, // 👈 usamos la prioridad seleccionada
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
      setPriority("low"); // 👈 reseteamos a valor por defecto si quieres
    } catch (err) {
      console.error("[frontend] Error en handleAddTask:", err);
    }
  };

  // ================================
  // 3) Toggle de completado
  // ================================
  const toggleTask = async (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    const updatedCompleted = !target.completed;

    // Optimistic UI
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

  // ================================
  // 4) Eliminar tarea
  // ================================
  const deleteTask = async (id: string) => {
    // Optimistic UI
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      await fetch(`${API_URL}/todos/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("[frontend] Error al borrar tarea:", err);
    }
  };

  // ================================
  // 5) Filtrar tareas POR FECHA
  // ================================
  const tasksForSelectedDate = tasks.filter((t) =>
    isSameDay(t.createdAt, selectedDate)
  );

  // ================================
  // 6) Métricas basadas en esa fecha
  // ================================
  const completedCount = tasksForSelectedDate.filter((t) => t.completed).length;
  const activeCount = tasksForSelectedDate.filter((t) => !t.completed).length;

  const completionRate =
    tasksForSelectedDate.length > 0
      ? Math.round((completedCount / tasksForSelectedDate.length) * 100)
      : 0;

  // ================================
  // 7) Filtro (all, active, completed)
  // ================================
  const filteredTasks = tasksForSelectedDate.filter((task) => {
    if (activeFilter === "active") return !task.completed;
    if (activeFilter === "completed") return task.completed;
    return true;
  });

  // ================================
  // 8) Retorno público del hook
  // ================================
  return {
    // raw
    tasks,
    newTask,
    activeFilter,
    selectedDate,
    priority,
    // setters
    setNewTask,
    setActiveFilter,
    setSelectedDate,
    setPriority,
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
