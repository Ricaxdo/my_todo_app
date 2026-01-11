import type { CreateWorkspaceInput, WorkspaceMember } from "./workspaces.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function readJsonSafe(res: Response) {
  return res.json().catch(() => null);
}

function errorFrom(
  res: Response,
  data: Record<string, unknown> | null,
  fallback: string
) {
  const message =
    typeof data?.message === "string"
      ? data.message
      : typeof data?.error === "string"
      ? data.error
      : `${fallback} (${res.status})`;

  return message;
}

export const workspacesApi = {
  list: async () => {
    const res = await fetch(`${API_URL}/workspaces`, {
      headers: authHeaders(),
    });
    const data = await readJsonSafe(res);
    if (!res.ok)
      throw new Error(errorFrom(res, data, "GET /workspaces failed"));
    return data;
  },

  joinByCode: async (code: string) => {
    const res = await fetch(`${API_URL}/workspaces/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ code }),
    });
    const data = await readJsonSafe(res);
    if (!res.ok) throw new Error(errorFrom(res, data, "JOIN failed"));
    return data;
  },

  create: async (input: CreateWorkspaceInput) => {
    const res = await fetch(`${API_URL}/workspaces`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ name: input.name /*, iconId: input.iconId*/ }),
    });
    const data = await readJsonSafe(res);
    if (!res.ok) throw new Error(errorFrom(res, data, "CREATE failed"));
    return data;
  },

  members: async (workspaceId: string): Promise<WorkspaceMember[]> => {
    const res = await fetch(`${API_URL}/workspaces/${workspaceId}/members`, {
      headers: authHeaders(),
    });
    const data = await readJsonSafe(res);
    if (!res.ok) throw new Error(errorFrom(res, data, "GET members failed"));
    return (data?.members ?? []) as WorkspaceMember[];
  },

  leave: async (workspaceId: string) => {
    const res = await fetch(`${API_URL}/workspaces/${workspaceId}/leave`, {
      method: "POST",
      headers: authHeaders(),
    });
    const data = await readJsonSafe(res);
    if (!res.ok) throw new Error(errorFrom(res, data, "LEAVE failed"));
    return data;
  },

  remove: async (workspaceId: string) => {
    const res = await fetch(`${API_URL}/workspaces/${workspaceId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    const data = await readJsonSafe(res);
    if (!res.ok)
      throw new Error(errorFrom(res, data, "DELETE workspace failed"));
    return data;
  },

  removeMember: async (workspaceId: string, memberUserId: string) => {
    const res = await fetch(
      `${API_URL}/workspaces/${workspaceId}/members/${memberUserId}`,
      { method: "DELETE", headers: authHeaders() }
    );
    const data = await readJsonSafe(res);
    if (!res.ok) throw new Error(errorFrom(res, data, "REMOVE member failed"));
    return data;
  },
};
