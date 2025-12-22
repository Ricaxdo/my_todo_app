"use client";

import { useWorkspaces } from "@/features/workspaces/workspace-context";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
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

function normalizeTasks(data: BackendTask[]): Task[] {
  return data.map((t) => ({
    ...t,
    createdAt: new Date(t.createdAt),
    updatedAt: t.updatedAt ? new Date(t.updatedAt) : undefined,
  }));
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

  useEffect(() => {
    const onStorage = () => {
      const token = getToken();
      if (!token) setTasks([]);
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // UX states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ================================
  // 1) Load tasks (reutilizable)
  // ================================
  const { currentWorkspaceId } = useWorkspaces();

  const loadTasks = useCallback(async () => {
    const token = getToken();
    if (!token || !currentWorkspaceId) {
      setTasks([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const yyyyMmDd = selectedDate.toISOString().slice(0, 10);

    try {
      const res = await fetch(
        `${API_URL}/workspaces/${currentWorkspaceId}/todos?date=${yyyyMmDd}`,
        { headers: authHeaders() }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          setTasks([]);
        }
        setError(
          data?.message || data?.error || `GET todos failed (${res.status})`
        );
        return;
      }

      if (!Array.isArray(data)) {
        setError("Expected array from todos endpoint");
        return;
      }

      setTasks(normalizeTasks(data as BackendTask[]));
    } catch {
      setError("Network error loading tasks");
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspaceId, selectedDate]);

  // Carga inicial (y sirve para F5 porque lee token del storage)
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

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
          text: newTask.trim(),
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
  // 3) Toggle de completado (con rollback)
  // ================================
  const toggleTask = async (id: string) => {
    const prev = tasks;
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    const updatedCompleted = !target.completed;

    // optimistic
    setTasks((curr) =>
      curr.map((t) => (t.id === id ? { ...t, completed: updatedCompleted } : t))
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
        // rollback
        setTasks(prev);
      }
    } catch (err) {
      console.error("[frontend] Error al actualizar tarea:", err);
      setTasks(prev);
    }
  };

  // ================================
  // 4) Eliminar tarea (con rollback)
  // ================================
  const deleteTask = async (id: string) => {
    const prev = tasks;
    setTasks((curr) => curr.filter((t) => t.id !== id));

    try {
      const res = await fetch(`${API_URL}/todos/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        console.error("[frontend] DELETE /todos/:id failed:", res.status, data);
        // rollback
        setTasks(prev);
      }
    } catch (err) {
      console.error("[frontend] Error al borrar tarea:", err);
      setTasks(prev);
    }
  };

  // ================================
  // 5) Logout (limpia token + tasks)
  // ================================
  const logout = () => {
    localStorage.removeItem("token");
    setTasks([]);
    setError(null);
  };

  // ================================
  // 6) Filtrar tareas POR FECHA
  // ================================
  const tasksForSelectedDate = tasks.filter((t) =>
    isSameDayLocal(t.createdAt, selectedDate)
  );

  // ================================
  // 7) Métricas
  // ================================
  const completedCount = tasksForSelectedDate.filter((t) => t.completed).length;
  const activeCount = tasksForSelectedDate.filter((t) => !t.completed).length;

  const completionRate =
    tasksForSelectedDate.length > 0
      ? Math.round((completedCount / tasksForSelectedDate.length) * 100)
      : 0;

  // ================================
  // 8) Filtro (all, active, completed)
  // ================================
  const filteredTasks = tasksForSelectedDate.filter((task) => {
    if (activeFilter === "active") return !task.completed;
    if (activeFilter === "completed") return task.completed;
    return true;
  });

  return {
    // raw
    tasks,
    newTask,
    activeFilter,
    selectedDate,
    priority,

    // UX
    isLoading,
    error,

    // setters
    setNewTask,
    setActiveFilter,
    setSelectedDate,
    setPriority,

    // actions
    loadTasks, // 👈 para recargar manual (ej: después de login si lo ocupas)
    logout, // 👈 para navbar logout
    handleAddTask,
    toggleTask,
    deleteTask,

    // derived
    filteredTasks,
    completedCount,
    activeCount,
    completionRate,
  };
}
