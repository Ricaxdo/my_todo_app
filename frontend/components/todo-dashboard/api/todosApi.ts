const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
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

async function safeJson(res: Response) {
  return res.json().catch(() => null);
}

export function todosBaseForWorkspace(workspaceId: string | null) {
  if (!workspaceId) return null;
  return `${API_URL}/workspaces/${workspaceId}/todos`;
}

export async function getTodos(
  base: string,
  day: string,
  signal?: AbortSignal
) {
  const res = await fetch(`${base}?date=${encodeURIComponent(day)}`, {
    headers: buildHeaders(),
    signal,
  });

  const data = await safeJson(res);

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("token");
    }
    throw new Error(
      data?.message || data?.error || `GET todos failed (${res.status})`
    );
  }

  if (!Array.isArray(data)) {
    throw new Error("Expected array from todos endpoint");
  }

  return data;
}

export async function createTodo(base: string, body: unknown) {
  const res = await fetch(base, {
    method: "POST",
    headers: buildHeaders({ json: true }),
    body: JSON.stringify(body),
  });

  const data = await safeJson(res);

  if (!res.ok) {
    throw new Error(
      data?.message || data?.error || "No se pudo crear la tarea"
    );
  }

  return data;
}

export async function updateTodo(base: string, id: string, body: unknown) {
  const res = await fetch(`${base}/${id}`, {
    method: "PUT",
    headers: buildHeaders({ json: true }),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await safeJson(res);
    throw new Error(
      data?.message || data?.error || `PUT todo failed (${res.status})`
    );
  }
}

export async function deleteTodo(base: string, id: string) {
  const res = await fetch(`${base}/${id}`, {
    method: "DELETE",
    headers: buildHeaders(),
  });

  if (!res.ok) {
    const data = await safeJson(res);
    throw new Error(
      data?.message || data?.error || `DELETE todo failed (${res.status})`
    );
  }
}
