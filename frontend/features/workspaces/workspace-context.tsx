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
  // opcional si luego guardas iconId:
  // iconId?: string;
};

export type WorkspaceMember = {
  userId: string;
  name: string;
  lastName?: string;
  role: "owner" | "admin" | "member";
  joinedAt: string | Date;
  isYou: boolean;
};

type CreateWorkspaceInput = {
  name: string;
  iconId?: string; // por ahora lo guardas FE, o luego lo mandas al BE
};

type WorkspaceCtx = {
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
  currentWorkspace: Workspace | null;
  setCurrentWorkspaceId: (id: string) => void;

  // ✅ mantener
  reloadWorkspaces: () => Promise<void>;
  // ✅ agregar (para tu modal)
  refreshWorkspaces: () => Promise<void>;

  // ✅ acciones
  joinWorkspaceByCode: (code: string) => Promise<void>;
  createWorkspace: (input: CreateWorkspaceInput) => Promise<void>;

  // ✅ límite
  canCreateOrJoinExtra: boolean;

  isLoading: boolean;
  error: string | null;

  getWorkspaceMembers: (workspaceId: string) => Promise<WorkspaceMember[]>;
  leaveWorkspace: (workspaceId: string) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  removeWorkspaceMember: (
    workspaceId: string,
    memberUserId: string
  ) => Promise<void>;
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

  const canCreateOrJoinExtra = useMemo(() => {
    const extraCount = workspaces.filter((w) => !w.isPersonal).length;
    return extraCount < 1; // ✅ máximo 1 extra
  }, [workspaces]);

  const reloadWorkspaces = useCallback(async () => {
    const token = getToken();

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

  // ✅ alias para que tu modal pueda usar refreshWorkspaces()
  const refreshWorkspaces = useCallback(async () => {
    await reloadWorkspaces();
  }, [reloadWorkspaces]);

  // ✅ join
  const joinWorkspaceByCode = useCallback(
    async (code: string) => {
      const token = getToken();
      if (!token) throw new Error("authorization required");

      if (!canCreateOrJoinExtra) {
        throw new Error(
          "Solo puedes tener 2 workspaces (personal + 1 adicional)."
        );
      }

      const res = await fetch(`${API_URL}/workspaces/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || `JOIN failed (${res.status})`
        );
      }

      const joinedId = data?.workspace?.id as string | undefined;

      await reloadWorkspaces();

      if (joinedId) {
        setCurrentWorkspaceId(joinedId);
      }
    },
    [canCreateOrJoinExtra, reloadWorkspaces, setCurrentWorkspaceId]
  );

  // ✅ create (cuando ya tengas endpoint en BE, esto ya funciona)
  const createWorkspace = useCallback(
    async (input: CreateWorkspaceInput) => {
      const token = getToken();
      if (!token) throw new Error("authorization required");

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

      // ✅ endpoint esperado: POST /workspaces { name }
      // (si luego agregas iconId en BE, lo mandas también)
      const res = await fetch(`${API_URL}/workspaces`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ name /*, iconId: input.iconId*/ }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || `CREATE failed (${res.status})`
        );
      }

      const createdId = data?.workspace?.id as string | undefined;

      await reloadWorkspaces();

      if (createdId) {
        setCurrentWorkspaceId(createdId);
      }
    },
    [canCreateOrJoinExtra, reloadWorkspaces, setCurrentWorkspaceId]
  );

  const getWorkspaceMembers = useCallback(async (workspaceId: string) => {
    const token = getToken();
    if (!token) throw new Error("authorization required");

    const res = await fetch(`${API_URL}/workspaces/${workspaceId}/members`, {
      headers: authHeaders(),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(
        data?.message || data?.error || `GET members failed (${res.status})`
      );
    }

    const members = (data?.members ?? []) as WorkspaceMember[];
    return members;
  }, []);

  const leaveWorkspace = useCallback(
    async (workspaceId: string) => {
      const token = getToken();
      if (!token) throw new Error("authorization required");

      const res = await fetch(`${API_URL}/workspaces/${workspaceId}/leave`, {
        method: "POST",
        headers: authHeaders(),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || `LEAVE failed (${res.status})`
        );
      }

      // refresca lista
      await reloadWorkspaces();
    },
    [reloadWorkspaces]
  );

  const deleteWorkspace = useCallback(
    async (workspaceId: string) => {
      const token = getToken();
      if (!token) throw new Error("authorization required");

      const res = await fetch(`${API_URL}/workspaces/${workspaceId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `DELETE workspace failed (${res.status})`
        );
      }

      await reloadWorkspaces();
    },
    [reloadWorkspaces]
  );

  const removeWorkspaceMember = useCallback(
    async (workspaceId: string, memberUserId: string) => {
      const token = getToken();
      if (!token) throw new Error("authorization required");

      const res = await fetch(
        `${API_URL}/workspaces/${workspaceId}/members/${memberUserId}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || `REMOVE member failed (${res.status})`
        );
      }
    },
    []
  );

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
