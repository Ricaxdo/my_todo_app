"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { workspacesApi } from "@/services/workspaces/workspaces.api";
import { mapWorkspaceList } from "@/services/workspaces/workspaces.mapper";
import type {
  CreateWorkspaceInput,
  Workspace,
} from "@/services/workspaces/workspaces.types";
import { useAuth } from "@/state/auth/auth-context";

import {
  clearSavedWorkspaceId,
  getSavedWorkspaceId,
  saveWorkspaceId,
} from "./workspace.storage";
import type { WorkspaceCtx } from "./workspace.types";

const Ctx = createContext<WorkspaceCtx | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspaceId, setCurrentWorkspaceIdState] = useState<
    string | null
  >(null);

  const { isAuthenticated } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setCurrentWorkspaceId = useCallback((id: string) => {
    setCurrentWorkspaceIdState(id);
    saveWorkspaceId(id);
  }, []);

  const canCreateOrJoinExtra = useMemo(() => {
    const extraCount = workspaces.filter((w) => !w.isPersonal).length;
    return extraCount < 1;
  }, [workspaces]);

  const reloadWorkspaces = useCallback(async () => {
    // Si no hay auth, limpiamos todo (evitamos UI “stale”)
    if (!isAuthenticated) {
      setWorkspaces([]);
      setCurrentWorkspaceIdState(null);
      setError(null);
      clearSavedWorkspaceId();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await workspacesApi.list();
      const list = mapWorkspaceList(data);

      setWorkspaces(list);

      const saved = getSavedWorkspaceId();
      const exists = saved && list.some((w) => w.id === saved);

      if (exists) {
        setCurrentWorkspaceIdState(saved);
      } else {
        const personal = list.find((w) => w.isPersonal);
        const fallback = personal?.id ?? list[0]?.id ?? null;

        setCurrentWorkspaceIdState(fallback);
        if (fallback) saveWorkspaceId(fallback);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error loading workspaces");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const refreshWorkspaces = useCallback(async () => {
    await reloadWorkspaces();
  }, [reloadWorkspaces]);

  useEffect(() => {
    reloadWorkspaces();
  }, [reloadWorkspaces]);

  const joinWorkspaceByCode = useCallback(
    async (code: string) => {
      if (!canCreateOrJoinExtra) {
        throw new Error(
          "Solo puedes tener 2 workspaces (personal + 1 adicional)."
        );
      }

      const data = await workspacesApi.joinByCode(code);
      const joinedId = data?.workspace?.id as string | undefined;

      await reloadWorkspaces();

      if (joinedId) setCurrentWorkspaceId(joinedId);
    },
    [canCreateOrJoinExtra, reloadWorkspaces, setCurrentWorkspaceId]
  );

  const createWorkspace = useCallback(
    async (input: CreateWorkspaceInput) => {
      if (!canCreateOrJoinExtra) {
        throw new Error(
          "Solo puedes tener 2 workspaces (personal + 1 adicional)."
        );
      }

      const name = input.name.trim();
      if (name.length < 2)
        throw new Error("El nombre debe tener al menos 2 caracteres.");
      if (name.length > 60)
        throw new Error("El nombre no puede exceder 60 caracteres.");

      const data = await workspacesApi.create({ ...input, name });
      const createdId = data?.workspace?.id as string | undefined;

      await reloadWorkspaces();

      if (createdId) setCurrentWorkspaceId(createdId);
    },
    [canCreateOrJoinExtra, reloadWorkspaces, setCurrentWorkspaceId]
  );

  const getWorkspaceMembers = useCallback(
    async (workspaceId: string) => workspacesApi.members(workspaceId),
    []
  );

  const leaveWorkspace = useCallback(
    async (workspaceId: string) => {
      await workspacesApi.leave(workspaceId);
      await reloadWorkspaces();
    },
    [reloadWorkspaces]
  );

  const deleteWorkspace = useCallback(
    async (workspaceId: string) => {
      await workspacesApi.remove(workspaceId);
      await reloadWorkspaces();
    },
    [reloadWorkspaces]
  );

  const removeWorkspaceMember = useCallback(
    async (workspaceId: string, memberUserId: string) => {
      await workspacesApi.removeMember(workspaceId, memberUserId);
      await reloadWorkspaces();
    },
    [reloadWorkspaces]
  );

  const currentWorkspace = useMemo(() => {
    if (!currentWorkspaceId) return null;
    return workspaces.find((w) => w.id === currentWorkspaceId) ?? null;
  }, [workspaces, currentWorkspaceId]);

  const value: WorkspaceCtx = {
    workspaces,
    currentWorkspaceId,
    currentWorkspace,
    setCurrentWorkspaceId,

    reloadWorkspaces,
    refreshWorkspaces,

    joinWorkspaceByCode,
    createWorkspace,

    canCreateOrJoinExtra,

    getWorkspaceMembers,
    leaveWorkspace,
    deleteWorkspace,
    removeWorkspaceMember,

    isLoading,
    error,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWorkspaces() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useWorkspaces must be used inside WorkspaceProvider");
  return ctx;
}
