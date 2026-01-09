// lib/api/clients.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ApiError = {
  status: number;
  message: string;
};

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window === "undefined" ? null : localStorage.getItem("token");

  const url = joinUrl(API_URL, path);

  let res: Response;
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
    throw {
      status: 0,
      message: err instanceof Error ? err.message : "Network error",
    } satisfies ApiError;
  }

  const text = await res.text();
  let body: Record<string, unknown> = {};

  try {
    body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    body = {};
  }

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
    }

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

  // ✅ ESTO es lo que te falta en tu archivo
  return body as T;
}
