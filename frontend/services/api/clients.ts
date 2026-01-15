// URL base del backend.
// Se toma desde env para producción y se cae a localhost en desarrollo.
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("Missing NEXT_PUBLIC_API_URL");
}

/**
 * Error normalizado que usa TODA la capa de services.
 * - status: HTTP status (0 = error de red / fetch)
 * - message: mensaje listo para mostrar en UI
 */
export type ApiError = {
  status: number;
  message: string;
};

/**
 * Une base + path evitando:
 * - dobles slashes
 * - paths sin slash inicial
 */
function joinUrl(base: string, path: string) {
  const b = base.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

const API_BASE: string = API_URL;

/**
 * Fetch centralizado de la app.
 *
 * Responsabilidades:
 * - Construir la URL final
 * - Inyectar headers comunes (JSON + Authorization)
 * - Normalizar errores (network + HTTP)
 * - Parsear respuesta de forma segura
 *
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  // Token solo en cliente (evitamos romper SSR)
  const token =
    typeof window === "undefined" ? null : localStorage.getItem("token");

  const url = joinUrl(API_BASE, path);

  let res: Response;

  // =========================
  // Request
  // =========================
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers ?? {}),
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch (err: unknown) {
    // Error de red (fetch falló antes de recibir respuesta)
    throw {
      status: 0,
      message: err instanceof Error ? err.message : "Network error",
    } satisfies ApiError;
  }

  // =========================
  // Response parsing (safe)
  // =========================
  const text = await res.text();
  let body: Record<string, unknown> = {};

  try {
    body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    // Respuesta no-JSON → body vacío
    body = {};
  }

  // =========================
  // HTTP errors
  // =========================
  if (!res.ok) {
    // Sesión inválida → limpiamos token en cliente
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
    }

    // Prioridad de mensaje:
    // 1. body.error
    // 2. body.message
    // 3. fallback genérico
    const message =
      typeof body.error === "string"
        ? body.error
        : typeof body.message === "string"
        ? body.message
        : `Request failed (${res.status})`;

    throw {
      status: res.status,
      message,
    } satisfies ApiError;
  }

  // =========================
  // Success
  // =========================
  return body as T;
}
