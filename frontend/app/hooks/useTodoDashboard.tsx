"use client";

import type React from "react";
import { useEffect, useState } from "react";
import type { BackendTask, Priority, Task } from "../types/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type Filter = "all" | "active" | "completed";

// Helper: comparar por día LOCAL (evita broncas UTC vs CDMX)
function isSameDayLocal(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

export function useTodoDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [priority, setPriority] = useState<Priority>("low");
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  // ================================
  // 1) Cargar tareas desde backend
  // ================================
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = getToken();
        console.log("[frontend] token?", token ? "✅ yes" : "❌ no");

        const res = await fetch(`${API_URL}/todos`, {
          headers: authHeaders(),
        });

        const data = await res.json().catch(() => null);
        console.log("[frontend] /todos response:", data);

        // ✅ si backend falla, aquí ves el error real (y no truena el .map)
        if (!res.ok) {
          console.error("[frontend] GET /todos failed:", res.status, data);
          return;
        }

        // ✅ aseguramos array
        if (!Array.isArray(data)) {
          console.error("[frontend] Expected array but got:", data);
          return;
        }

        const normalized: Task[] = (data as BackendTask[]).map((t) => ({
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
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          text: newTask,
          priority,
          category: "General",
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        console.error("[frontend] POST /todos failed:", res.status, data);
        return;
      }

      const created = data as BackendTask;

      const task: Task = {
        ...created,
        createdAt: new Date(created.createdAt),
        updatedAt: created.updatedAt ? new Date(created.updatedAt) : undefined,
      };

      setTasks((prev) => [task, ...prev]);
      setNewTask("");
      setPriority("low");
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

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: updatedCompleted } : t))
    );

    try {
      const res = await fetch(`${API_URL}/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ completed: updatedCompleted }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        console.error("[frontend] PUT /todos/:id failed:", res.status, data);
      }
    } catch (err) {
      console.error("[frontend] Error al actualizar tarea:", err);
    }
  };

  // ================================
  // 4) Eliminar tarea
  // ================================
  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      const res = await fetch(`${API_URL}/todos/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        console.error("[frontend] DELETE /todos/:id failed:", res.status, data);
      }
    } catch (err) {
      console.error("[frontend] Error al borrar tarea:", err);
    }
  };

  // ================================
  // 5) Filtrar tareas POR FECHA
  // ================================
  const tasksForSelectedDate = tasks.filter((t) =>
    isSameDayLocal(t.createdAt, selectedDate)
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

  return {
    tasks,
    newTask,
    activeFilter,
    selectedDate,
    priority,
    setNewTask,
    setActiveFilter,
    setSelectedDate,
    setPriority,
    handleAddTask,
    toggleTask,
    deleteTask,
    filteredTasks,
    completedCount,
    activeCount,
    completionRate,
  };
}
