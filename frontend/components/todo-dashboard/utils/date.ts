/**
 * Retorna el inicio del día en hora LOCAL (00:00:00).
 *
 * ⚠️ No usa UTC intencionalmente.
 * Se usa para:
 * - dueDate
 * - selectedDate
 * evitando desfases al serializar fechas entre FE y BE.
 */
export function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/**
 * Convierte una fecha a string "yyyy-MM-dd" en hora LOCAL.
 *
 * Este formato:
 * - evita bugs de corrimiento por UTC / ISO strings
 * - es el contrato esperado por el backend para filtrar por día
 *
 * 👉 Preferido sobre `toISOString()` para fechas de calendario.
 */
export function toDayStringLocal(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
