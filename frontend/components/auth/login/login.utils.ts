/**
 * Normaliza email:
 * - trim
 * - lowercase
 */
export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

/**
 * Evita redirects raros:
 * - si no hay next -> /dashboard
 * - si next no empieza con "/" -> /dashboard
 */
export function safeNext(next: string | null) {
  if (!next) return "/dashboard";
  return next.startsWith("/") ? next : "/dashboard";
}
