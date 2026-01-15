import type { ApiError } from "./clients";

export async function apiFetchBase<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  let res: Response;

  try {
    res = await fetch(url, options);
  } catch (err: unknown) {
    throw {
      status: 0,
      message: err instanceof Error ? err.message : "Network error",
    } satisfies ApiError;
  }

  // Parseo “safe”: soporta JSON o respuesta vacía
  const text = await res.text();
  let body: Record<string, unknown> = {};

  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = {};
  }

  if (!res.ok) {
    const message =
      typeof body?.error === "string"
        ? body.error
        : typeof body?.message === "string"
        ? body.message
        : `Request failed (${res.status})`;

    throw {
      status: res.status,
      message,
    } satisfies ApiError;
  }

  return body as T;
}
