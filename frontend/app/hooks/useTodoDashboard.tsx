"use client";

import { useAuth } from "@/features/auth/auth-context";
import type { WorkspaceMember } from "@/features/workspaces/workspace-context";
import { useWorkspaces } from "@/features/workspaces/workspace-context";
import { format } from "date-fns";
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

function tzHeader(): HeadersInit {
  const tz =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Mexico_City";
  return { "X-Timezone": tz };
}

type Filter = "all" | "active" | "completed";

function normalizeTasks(data: BackendTask[]): Task[] {
  return data.map((t) => ({
    ...t,
    createdAt: new Date(t.createdAt),
    updatedAt: t.updatedAt ? new Date(t.updatedAt) : undefined,
  }));
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function toDayString(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function useTodoDashboard() {
  const { currentWorkspaceId, currentWorkspace, getWorkspaceMembers } =
    useWorkspaces();

  const { user } = useAuth();
  const meIdFromAuth = user?._id ?? null;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [priority, setPriority] = useState<Priority>("low");

  // ✅ dueDate como día (backend lo convierte a fin del día en tz)
  const [dueDate, setDueDate] = useState<Date>(() => startOfDay(new Date()));

  // ✅ members / assignees
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [meId, setMeId] = useState<string | null>(null);
  const [assignees, setAssignees] = useState<string[]>([]);

  // loader switching workspace
  const [isWorkspaceSwitching, setIsWorkspaceSwitching] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setIsWorkspaceSwitching(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setIsWorkspaceSwitching(false);
    }, 400);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [currentWorkspaceId]);

  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    startOfDay(new Date())
  );

  // UX states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const todosBase = useMemo(() => {
    if (!currentWorkspaceId) return null;
    return `${API_URL}/workspaces/${currentWorkspaceId}/todos`;
  }, [currentWorkspaceId]);

  // ================================
  // A) Load members (solo si workspace extra)
  // ================================
  useEffect(() => {
    let cancelled = false;

    async function loadMembersIfNeeded() {
      setMembers([]);
      setMeId(null);

      if (!currentWorkspaceId || !currentWorkspace) return;

      // personal: no cargamos members
      if (currentWorkspace.isPersonal) {
        // para personal, el backend debería default asignar a userId
        setAssignees([]);
        return;
      }

      try {
        const list = await getWorkspaceMembers(currentWorkspaceId);
        if (cancelled) return;

        setMembers(list);

        const myId = list.find((m) => m.isYou)?.userId ?? null;
        setMeId(myId);

        // default: asignado a mí si se puede; si no, al primero
        if (myId) setAssignees([myId]);
        else if (list[0]?.userId) setAssignees([list[0].userId]);
        else setAssignees([]);
      } catch (err: unknown) {
        if (cancelled) return;
        const msg =
          err instanceof Error ? err.message : "Error loading members";
        setError(msg);
      }
    }

    loadMembersIfNeeded();
    return () => {
      cancelled = true;
    };
  }, [currentWorkspaceId, currentWorkspace, getWorkspaceMembers]);

  const membersForForm = useMemo(
    () =>
      members.map((m) => ({
        id: m.userId,
        name: `${m.name}${m.lastName ? ` ${m.lastName}` : ""}`.trim(),
      })),
    [members]
  );

  // ================================
  // 1) Load tasks (workspace + date)
  // ================================
  const loadTasks = useCallback(async () => {
    const token = getToken();

    if (!token || !todosBase) {
      setTasks([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const dateIso = selectedDate.toISOString();
      const res = await fetch(
        `${todosBase}?date=${encodeURIComponent(dateIso)}`,
        { headers: { ...authHeaders(), ...tzHeader() } }
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
  }, [todosBase, selectedDate]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // ================================
  // 2) Crear task (workspace actual)
  // ================================
  const handleAddTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    if (!todosBase) return;

    // ✅ personal: no mandamos assignees (backend default)
    // ✅ extra: mandamos assignees; si está vacío, intentamos [meId]
    const assigneesToSend = currentWorkspace?.isPersonal
      ? meIdFromAuth
        ? [meIdFromAuth]
        : undefined // ✅ backend default
      : assignees.length
      ? assignees
      : meIdFromAuth
      ? [meIdFromAuth]
      : undefined;

    try {
      const res = await fetch(todosBase, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
          ...tzHeader(),
        },
        body: JSON.stringify({
          text: newTask.trim(),
          priority,
          category: "General",
          dueDate: toDayString(dueDate),
          ...(assigneesToSend ? { assignees: assigneesToSend } : {}),
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

      // reset
      setNewTask("");
      setPriority("low");
      setDueDate(startOfDay(new Date()));
    } catch {
      setError("Network error creating task");
    }
  };

  // ================================
  // 3) Toggle completado
  // ================================
  const toggleTask = async (id: string) => {
    if (!todosBase) return;

    const prev = tasks;
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    const updatedCompleted = !target.completed;

    setTasks((curr) =>
      curr.map((t) => (t.id === id ? { ...t, completed: updatedCompleted } : t))
    );

    try {
      const res = await fetch(`${todosBase}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
          ...tzHeader(),
        },
        body: JSON.stringify({ completed: updatedCompleted }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        console.error("[frontend] PUT todo failed:", res.status, data);
        setTasks(prev);
      }
    } catch {
      setTasks(prev);
    }
  };

  // ================================
  // 4) Eliminar tarea
  // ================================
  const deleteTask = async (id: string) => {
    if (!todosBase) return;

    const prev = tasks;
    setTasks((curr) => curr.filter((t) => t.id !== id));

    try {
      const res = await fetch(`${todosBase}/${id}`, {
        method: "DELETE",
        headers: { ...authHeaders(), ...tzHeader() },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        console.error("[frontend] DELETE todo failed:", res.status, data);
        setTasks(prev);
      }
    } catch {
      setTasks(prev);
    }
  };

  // ================================
  // 5) Filtrado
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
    // data
    tasks,
    filteredTasks,
    newTask,
    activeFilter,
    selectedDate,
    priority,

    activeCount,
    completionRate,

    // dueDate + assignment
    dueDate,
    setDueDate,
    members: membersForForm,
    assignees,
    setAssignees,

    // workspace
    currentWorkspace,
    isPersonalWorkspace: currentWorkspace?.isPersonal === true,
    meId, // ✅ ya no existe meIdFromAuth

    // ux
    isLoading,
    error,
    isWorkspaceSwitching,

    // setters
    setNewTask,
    setActiveFilter,
    setSelectedDate,
    setPriority,

    // actions
    loadTasks,
    handleAddTask,
    toggleTask,
    deleteTask,
  };
}
