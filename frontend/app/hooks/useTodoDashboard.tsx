"use client";

import { useWorkspaces } from "@/features/workspaces/workspace-context";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

function normalizeTasks(data: BackendTask[]): Task[] {
  return data.map((t) => ({
    ...t,
    createdAt: new Date(t.createdAt),
    updatedAt: t.updatedAt ? new Date(t.updatedAt) : undefined,
  }));
}

export function useTodoDashboard() {
  const { currentWorkspaceId } = useWorkspaces();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [priority, setPriority] = useState<Priority>("low");

  const [isWorkspaceSwitching, setIsWorkspaceSwitching] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // cuando cambie workspaceId → muestra loader breve
    setIsWorkspaceSwitching(true);

    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setIsWorkspaceSwitching(false);
    }, 400);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [currentWorkspaceId]);

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // UX states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Base URL para todos los calls del workspace actual
  const todosBase = useMemo(() => {
    if (!currentWorkspaceId) return null;
    return `${API_URL}/workspaces/${currentWorkspaceId}/todos`;
  }, [currentWorkspaceId]);

  useEffect(() => {
    const onStorage = () => {
      const token = getToken();
      if (!token) setTasks([]);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ================================
  // 1) Load tasks (por workspace + date)
  // ================================
  const loadTasks = useCallback(async () => {
    const token = getToken();

    // si no hay sesión o no hay workspace seleccionado
    if (!token || !todosBase) {
      setTasks([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // mejor mandar ISO completo; el backend ya valida/parsea
      const dateIso = selectedDate.toISOString();
      const res = await fetch(
        `${todosBase}?date=${encodeURIComponent(dateIso)}`,
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
    } catch (e) {
      setError("Network error loading tasks");
    } finally {
      setIsLoading(false);
    }
  }, [todosBase, selectedDate]);

  // ✅ recarga al entrar / cambiar workspace / cambiar fecha
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // ================================
  // 2) Crear nueva tarea (en workspace actual)
  // ================================
  const handleAddTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    // sin workspace seleccionado no permitas crear
    if (!todosBase) return;

    try {
      const res = await fetch(todosBase, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          text: newTask.trim(),
          priority,
          category: "General",
          // si tu backend usa dueDate, aquí podrías mandarlo después
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        console.error("[frontend] POST todos failed:", res.status, data);
        setError(data?.message || data?.error || "No se pudo crear la tarea");
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
      setError("Network error creating task");
    }
  };

  // ================================
  // 3) Toggle completado (en workspace actual)
  // ================================
  const toggleTask = async (id: string) => {
    if (!todosBase) return;

    const prev = tasks;
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    const updatedCompleted = !target.completed;

    // optimistic
    setTasks((curr) =>
      curr.map((t) => (t.id === id ? { ...t, completed: updatedCompleted } : t))
    );

    try {
      const res = await fetch(`${todosBase}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ completed: updatedCompleted }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        console.error("[frontend] PUT todo failed:", res.status, data);
        setTasks(prev); // rollback
      }
    } catch (err) {
      console.error("[frontend] Error al actualizar tarea:", err);
      setTasks(prev);
    }
  };

  // ================================
  // 4) Eliminar tarea (en workspace actual)
  // ================================
  const deleteTask = async (id: string) => {
    if (!todosBase) return;

    const prev = tasks;
    setTasks((curr) => curr.filter((t) => t.id !== id));

    try {
      const res = await fetch(`${todosBase}/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        console.error("[frontend] DELETE todo failed:", res.status, data);
        setTasks(prev); // rollback
      }
    } catch (err) {
      console.error("[frontend] Error al borrar tarea:", err);
      setTasks(prev);
    }
  };

  // ================================
  // 5) Logout
  // ================================
  const logout = () => {
    localStorage.removeItem("token");
    setTasks([]);
    setError(null);
  };

  // ================================
  // 6) Filtrado (ya viene filtrado por date desde backend)
  // ================================
  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === "active") return !task.completed;
    if (activeFilter === "completed") return task.completed;
    return true;
  });

  const completedCount = filteredTasks.filter((t) => t.completed).length;
  const activeCount = filteredTasks.filter((t) => !t.completed).length;
  const completionRate =
    filteredTasks.length > 0
      ? Math.round((completedCount / filteredTasks.length) * 100)
      : 0;

  return {
    tasks,
    newTask,
    activeFilter,
    selectedDate,
    priority,

    isLoading,
    error,

    setNewTask,
    setActiveFilter,
    setSelectedDate,
    setPriority,

    loadTasks,
    logout,
    handleAddTask,
    toggleTask,
    deleteTask,

    filteredTasks,
    completedCount,
    activeCount,
    completionRate,

    isWorkspaceSwitching,
  };
}
