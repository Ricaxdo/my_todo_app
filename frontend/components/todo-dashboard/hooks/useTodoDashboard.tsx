"use client";

import { useAuth } from "@/state/auth/auth-context";
import type { WorkspaceMember } from "@/state/workspaces/workspace-context";
import { useWorkspaces } from "@/state/workspaces/workspace-context";
import type { BackendTask, Priority, Task } from "@/types/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  createTodo,
  deleteTodo,
  getTodos,
  todosBaseForWorkspace,
  updateTodo,
} from "../api/todosApi";
import { normalizeTasks, taskIdOf } from "../mappers/todoMapper";
import {
  startOfDay,
  toDayStringLocal,
  toUtcBucketDayFromLocalDay,
} from "../utils/date";

type Filter = "all" | "active" | "completed";

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

  const isPersonalWorkspace = currentWorkspace?.isPersonal === true;

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

  const myUserId = isPersonalWorkspace ? meIdFromAuth : meIdInWorkspace;

  const todosBase = useMemo(
    () => todosBaseForWorkspace(currentWorkspaceId),
    [currentWorkspaceId]
  );

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
    if (!todosBase) {
      setTasks([]);
      setError(null);
      return;
    }

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setIsLoading(true);
    setError(null);

    try {
      const day = toUtcBucketDayFromLocalDay(selectedDate);
      const data = await getTodos(todosBase, day, ctrl.signal);

      setTasks(normalizeTasks(data as BackendTask[]));
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Error loading tasks");
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

      const assigneesToSend = isPersonalWorkspace
        ? meIdFromAuth
          ? [meIdFromAuth]
          : undefined
        : assignees.length
        ? assignees
        : meIdFromAuth
        ? [meIdFromAuth]
        : undefined;

      try {
        const created = await createTodo(todosBase, {
          text: newTask.trim(),
          priority,
          category: "General",
          // ✅ la tarea se crea para el día actualmente visible
          dueDate: toDayStringLocal(selectedDate),
          ...(assigneesToSend ? { assignees: assigneesToSend } : {}),
        });

        const [task] = normalizeTasks([created as BackendTask]);
        setTasks((prev) => [task, ...prev]);

        setNewTask("");
        setPriority("low");

        // ✅ mantener el picker alineado con el día del tablero
        setDueDate(startOfDay(selectedDate));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error creating task");
      }
    },
    [
      newTask,
      todosBase,
      isPersonalWorkspace,
      meIdFromAuth,
      assignees,
      priority,
      selectedDate,
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
        await updateTodo(todosBase, id, { completed: updatedCompleted });
      } catch {
        setTasks(prev);
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
        await deleteTodo(todosBase, id);
      } catch {
        setTasks(prev);
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
    isPersonalWorkspace,
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
