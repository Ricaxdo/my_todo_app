"use client";

import { useAuth } from "@/state/auth/auth-context";
import type { WorkspaceMember } from "@/state/workspaces/workspace-context";
import { useWorkspaces } from "@/state/workspaces/workspace-context";
import type { BackendTask, Priority, Task } from "@/types/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Filter = "all" | "active" | "completed";

/** Día local (no UTC) */
function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** "yyyy-MM-dd" sin depender de date-fns (evita peso extra) */
function toDayStringLocal(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

/** BackendTask -> Task: normaliza Date fields */
function normalizeTasks(data: BackendTask[]): Task[] {
  return data.map((t) => ({
    ...t,
    createdAt: new Date(t.createdAt),
    updatedAt: t.updatedAt ? new Date(t.updatedAt) : undefined,
    dueDate: t.dueDate ? new Date(t.dueDate) : null,
  }));
}

/**
 * Si tu backend regresa `_id` en vez de `id`,
 * adapta aquí (y listo, no regamos ese detalle por todo el hook).
 */
function taskIdOf(t: Task | BackendTask): string {
  // @ts-expect-error: soporta ambos shapes
  return (t.id ?? t._id) as string;
}

function buildHeaders(opts?: { json?: boolean }): HeadersInit {
  const token = getToken();
  const tz =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Mexico_City";

  return {
    ...(opts?.json ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "X-Timezone": tz,
  };
}

export function useTodoDashboard() {
  const { currentWorkspaceId, currentWorkspace, getWorkspaceMembers } =
    useWorkspaces();
  const { user } = useAuth();

  const meIdFromAuth = user?._id ?? null;

  // =========================
  // UI state
  // =========================
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [priority, setPriority] = useState<Priority>("low");

  // dueDate se manda como "día" (backend lo interpreta en tz al final del día)
  const [dueDate, setDueDate] = useState<Date>(() => startOfDay(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    startOfDay(new Date())
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =========================
  // Workspace switching UX
  // =========================
  const [isWorkspaceSwitching, setIsWorkspaceSwitching] = useState(false);
  const switchTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setIsWorkspaceSwitching(true);
    if (switchTimerRef.current) window.clearTimeout(switchTimerRef.current);

    switchTimerRef.current = window.setTimeout(() => {
      setIsWorkspaceSwitching(false);
    }, 400);

    return () => {
      if (switchTimerRef.current) window.clearTimeout(switchTimerRef.current);
    };
  }, [currentWorkspaceId]);

  // =========================
  // Members / assignees (solo extra workspace)
  // =========================
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [meIdInWorkspace, setMeIdInWorkspace] = useState<string | null>(null);
  const [assignees, setAssignees] = useState<string[]>([]);

  const myUserId = currentWorkspace?.isPersonal
    ? meIdFromAuth
    : meIdInWorkspace;

  const todosBase = useMemo(() => {
    if (!currentWorkspaceId) return null;
    return `${API_URL}/workspaces/${currentWorkspaceId}/todos`;
  }, [currentWorkspaceId]);

  useEffect(() => {
    let cancelled = false;

    async function loadMembersIfNeeded() {
      setMembers([]);
      setMeIdInWorkspace(null);

      if (!currentWorkspaceId || !currentWorkspace) return;

      // Personal: no cargamos members; backend puede default asignar al user
      if (currentWorkspace.isPersonal) {
        setAssignees([]);
        return;
      }

      try {
        const list = await getWorkspaceMembers(currentWorkspaceId);
        if (cancelled) return;

        setMembers(list);

        const myId = list.find((m) => m.isYou)?.userId ?? null;
        setMeIdInWorkspace(myId);

        // default assignee: yo si existe, si no el primero
        if (myId) setAssignees([myId]);
        else if (list[0]?.userId) setAssignees([list[0].userId]);
        else setAssignees([]);
      } catch (err: unknown) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Error loading members");
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

  // =========================
  // Load tasks (workspace + day)
  // =========================
  const abortRef = useRef<AbortController | null>(null);

  const loadTasks = useCallback(async () => {
    const token = getToken();
    if (!token || !todosBase) {
      setTasks([]);
      setError(null);
      return;
    }

    // Cancela request anterior para evitar race
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setIsLoading(true);
    setError(null);

    try {
      // IMPORTANTE: manda día, no ISO (evita corrimiento por UTC)
      const day = toDayStringLocal(selectedDate);

      const res = await fetch(`${todosBase}?date=${encodeURIComponent(day)}`, {
        headers: buildHeaders(),
        signal: ctrl.signal,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        // Si tu auth-context maneja logout/token removal, mejor delega allá
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
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError("Network error loading tasks");
    } finally {
      setIsLoading(false);
    }
  }, [todosBase, selectedDate]);

  useEffect(() => {
    loadTasks();
    return () => abortRef.current?.abort();
  }, [loadTasks]);

  // =========================
  // Crear task
  // =========================
  const handleAddTask = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!newTask.trim() || !todosBase) return;

      // Personal: backend puede default asignar a user; extra: manda assignees
      const assigneesToSend = currentWorkspace?.isPersonal
        ? meIdFromAuth
          ? [meIdFromAuth]
          : undefined
        : assignees.length
        ? assignees
        : meIdFromAuth
        ? [meIdFromAuth]
        : undefined;

      try {
        const res = await fetch(todosBase, {
          method: "POST",
          headers: buildHeaders({ json: true }),
          body: JSON.stringify({
            text: newTask.trim(),
            priority,
            category: "General",
            dueDate: toDayStringLocal(dueDate),
            ...(assigneesToSend ? { assignees: assigneesToSend } : {}),
          }),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          setError(data?.message || data?.error || "No se pudo crear la tarea");
          return;
        }

        const created = data as BackendTask;
        const [task] = normalizeTasks([created]);

        setTasks((prev) => [task, ...prev]);

        // reset form
        setNewTask("");
        setPriority("low");
        setDueDate(startOfDay(new Date()));
      } catch {
        setError("Network error creating task");
      }
    },
    [
      newTask,
      todosBase,
      currentWorkspace?.isPersonal,
      meIdFromAuth,
      assignees,
      priority,
      dueDate,
    ]
  );

  // =========================
  // Toggle completado (optimistic)
  // =========================
  const toggleTask = useCallback(
    async (id: string) => {
      if (!todosBase) return;

      const prev = tasks;
      const target = tasks.find((t) => taskIdOf(t) === id);
      if (!target) return;

      const updatedCompleted = !target.completed;

      setTasks((curr) =>
        curr.map((t) =>
          taskIdOf(t) === id ? { ...t, completed: updatedCompleted } : t
        )
      );

      try {
        const res = await fetch(`${todosBase}/${id}`, {
          method: "PUT",
          headers: buildHeaders({ json: true }),
          body: JSON.stringify({ completed: updatedCompleted }),
        });

        if (!res.ok) {
          setTasks(prev); // rollback
        }
      } catch {
        setTasks(prev); // rollback
      }
    },
    [todosBase, tasks]
  );

  // =========================
  // Delete (optimistic)
  // =========================
  const deleteTask = useCallback(
    async (id: string) => {
      if (!todosBase) return;

      const prev = tasks;
      setTasks((curr) => curr.filter((t) => taskIdOf(t) !== id));

      try {
        const res = await fetch(`${todosBase}/${id}`, {
          method: "DELETE",
          headers: buildHeaders(),
        });

        if (!res.ok) setTasks(prev); // rollback
      } catch {
        setTasks(prev); // rollback
      }
    },
    [todosBase, tasks]
  );

  // =========================
  // Derived data
  // =========================
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (activeFilter === "active") return !task.completed;
      if (activeFilter === "completed") return task.completed;
      return true;
    });
  }, [tasks, activeFilter]);

  const stats = useMemo(() => {
    const completedCount = filteredTasks.filter((t) => t.completed).length;
    const activeCount = filteredTasks.length - completedCount;

    const completionRate =
      filteredTasks.length > 0
        ? Math.round((completedCount / filteredTasks.length) * 100)
        : 0;

    const userActiveCount = filteredTasks.filter((t) => {
      if (t.completed) return false;
      if (!myUserId) return false;
      const ids = Array.isArray(t.assignees) ? t.assignees : [];
      return ids.includes(myUserId);
    }).length;

    return { completedCount, activeCount, completionRate, userActiveCount };
  }, [filteredTasks, myUserId]);

  // Solo resetea el estado del dashboard (logout real: auth-context)
  const resetDashboardState = useCallback(() => {
    setTasks([]);
    setNewTask("");
    setActiveFilter("all");
    setPriority("low");
    setError(null);
    setIsLoading(false);

    setSelectedDate(startOfDay(new Date()));
    setDueDate(startOfDay(new Date()));

    setMembers([]);
    setMeIdInWorkspace(null);
    setAssignees([]);
    setIsWorkspaceSwitching(false);
  }, []);

  return {
    // data
    tasks,
    filteredTasks,
    newTask,
    activeFilter,
    selectedDate,
    priority,

    // stats
    activeCount: stats.activeCount,
    completionRate: stats.completionRate,
    userActiveCount: stats.userActiveCount,

    // dueDate + assignment
    dueDate,
    setDueDate,
    members: membersForForm,
    assignees,
    setAssignees,

    // workspace
    currentWorkspace,
    isPersonalWorkspace: currentWorkspace?.isPersonal === true,
    meId: meIdInWorkspace,

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

    // reset local UI
    resetDashboardState,
  };
}
