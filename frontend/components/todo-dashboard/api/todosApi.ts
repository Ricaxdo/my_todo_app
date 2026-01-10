// Base URL del backend (expuesta al FE vía NEXT_PUBLIC_*)
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * Obtiene el token JWT del cliente.
 */
function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

/**
 * Construye headers comunes para todas las requests al backend.
 * - Authorization: Bearer <token> (si existe)
 * - X-Timezone: zona horaria del cliente (para manejo correcto de fechas)
 * - Content-Type: application/json (solo si se requiere)
 */
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

/**
 * Parsea JSON de forma segura.
 * Evita que un body vacío o malformado rompa la app.
 */
async function safeJson(res: Response) {
  return res.json().catch(() => null);
}

/**
 * Construye la base URL de todos los endpoints de todos
 * para un workspace específico.
 */
export function todosBaseForWorkspace(workspaceId: string | null) {
  if (!workspaceId) return null;
  return `${API_URL}/workspaces/${workspaceId}/todos`;
}

/**
 * Obtiene todos los todos de un workspace para un día específico.
 * - `day` se manda como "yyyy-MM-dd" (no ISO) para evitar bugs de timezone.
 * - Soporta AbortController para cancelar requests al cambiar de vista/workspace.
 */
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
    // Sesión inválida → limpiamos token (logout se maneja en otro nivel)
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

/**
 * Crea un nuevo todo en el workspace actual.
 * El body se espera ya validado desde el hook/UI.
 */
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

/**
 * Actualiza parcialmente un todo (ej. completed, priority, etc.).
 * Usado principalmente para optimistic updates.
 */
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

/**
 * Elimina un todo por ID.
 * El rollback del estado se maneja en el hook si falla.
 */
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
