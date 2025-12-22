"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type Workspace = {
  id: string;
  name: string;
  owner: string;
  isPersonal: boolean;
  inviteCode: string | null; // personal => null
};

type WorkspaceCtx = {
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
  currentWorkspace: Workspace | null;

  setCurrentWorkspaceId: (id: string) => void;

  reloadWorkspaces: () => Promise<void>;
  refreshWorkspaces: () => Promise<void>;

  joinWorkspaceByCode: (code: string) => Promise<void>;

  isLoading: boolean;
  error: string | null;
};

const Ctx = createContext<WorkspaceCtx | null>(null);

const LS_KEY = "currentWorkspaceId";

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspaceId, setCurrentWorkspaceIdState] = useState<
    string | null
  >(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setCurrentWorkspaceId = useCallback((id: string) => {
    setCurrentWorkspaceIdState(id);
    localStorage.setItem(LS_KEY, id);
  }, []);

  const reloadWorkspaces = useCallback(async () => {
    const token = getToken();

    // ✅ si no hay token, limpia todo (incluyendo LS)
    if (!token) {
      setWorkspaces([]);
      setCurrentWorkspaceIdState(null);
      setError(null);
      localStorage.removeItem(LS_KEY);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/workspaces`, {
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          data?.message ||
          data?.error ||
          `GET /workspaces failed (${res.status})`;
        setError(msg);
        return;
      }

      const raw = (data?.workspaces ?? []) as Array<Record<string, unknown>>;

      const list: Workspace[] = raw.map((w) => {
        const isPersonal =
          w.isPersonal === true ||
          w.isPersonal === "true" ||
          w.is_personal === true ||
          w.is_personal === "true";

        return {
          id: String(w.id ?? w._id ?? ""),
          name: String(w.name ?? "workspace"),
          owner: String(w.owner ?? ""),
          isPersonal,
          inviteCode: isPersonal
            ? null
            : w.inviteCode
            ? String(w.inviteCode)
            : null,
        };
      });

      setWorkspaces(list);

      // elegir workspace actual
      const saved = localStorage.getItem(LS_KEY);
      const exists = saved && list.some((w) => w.id === saved);

      if (exists) {
        setCurrentWorkspaceIdState(saved);
      } else {
        // default: personal si existe, si no el primero
        const personal = list.find((w) => w.isPersonal);
        const fallback = personal?.id ?? list[0]?.id ?? null;
        setCurrentWorkspaceIdState(fallback);
        if (fallback) localStorage.setItem(LS_KEY, fallback);
      }
    } catch {
      setError("Network error loading workspaces");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const joinWorkspaceByCode = useCallback(async (code: string) => {
    const token = getToken();
    if (!token) throw new Error("No auth token");

    const clean = code.trim().toUpperCase();
    if (!clean) throw new Error("Código requerido");

    const res = await fetch(`${API_URL}/workspaces/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({ code: clean }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const msg = data?.message || data?.error || `Join failed (${res.status})`;
      throw new Error(msg);
    }

    // ✅ opcional: si backend responde workspace, lo seleccionamos
    const joinedId = data?.workspace?.id as string | undefined;
    if (joinedId) {
      setCurrentWorkspaceIdState(joinedId);
      localStorage.setItem(LS_KEY, joinedId);
    }
  }, []);

  const refreshWorkspaces = useCallback(async () => {
    await reloadWorkspaces();
  }, [reloadWorkspaces]);

  useEffect(() => {
    reloadWorkspaces();
  }, [reloadWorkspaces]);

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
