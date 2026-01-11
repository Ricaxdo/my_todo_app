/**
 * Retorna el inicio del día en **hora LOCAL** (00:00:00).
 *
 * Intencionalmente NO usa UTC.
 *
 * Se usa para:
 * - inicializar selectedDate (día visible en el dashboard)
 * - alinear dueDate con el día calendario del usuario
 *
 * Evita corrimientos de fecha cuando se serializa/deserializa
 * entre frontend (local) y backend (UTC).
 */
export function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/**
 * Convierte una fecha a string `"yyyy-MM-dd"` en **hora LOCAL**.
 *
 * Este string representa un **día calendario**, NO un timestamp.
 *
 * Se usa como:
 * - valor de calendario (UI)
 * - input semántico para el backend (día seleccionado)
 *
 * Preferido sobre `toISOString()` para evitar
 * desfases por timezone (UTC).
 */
export function toDayStringLocal(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Convierte un **día LOCAL** al **bucket de día en UTC**
 * que utiliza el backend para filtrar los todos.
 *
 * - El backend guarda fechas en UTC
 * - Los todos se crean al final del día LOCAL (23:59:59)
 * - Eso puede caer en el **día siguiente en UTC**
 *
 * Esta función:
 * 1) Toma el fin del día LOCAL
 * 2) Lo convierte a ISO (UTC)
 * 3) Extrae el día `"yyyy-MM-dd"` correspondiente en UTC
 *
 * Permite que el FE y BE estén alineados
 * sin romper la UX basada en día local.
 */
export function toUtcBucketDayFromLocalDay(localDay: Date) {
  const end = new Date(localDay);
  end.setHours(23, 59, 59, 999); // fin del día LOCAL
  return end.toISOString().slice(0, 10); // día UTC (YYYY-MM-DD)
}
