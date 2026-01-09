const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ApiError = {
  status: number;
  message: string;
};

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone; // 👈 clave

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Timezone": timezone, // 👈 se manda SIEMPRE
      ...(options.headers ?? {}),
    },
    credentials: "include",
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw {
      status: res.status,
      message: body?.error || body?.message || `Request failed (${res.status})`,
    } as ApiError;
  }

  return body as T;
}
