import { DateTime } from "luxon";

/**
 * Timezone por defecto de la aplicación.
 * Centralizarlo evita hardcodes dispersos y bugs de fechas.
 */
export const DEFAULT_TZ = "America/Mexico_City";

/**
 * Devuelve el final del día (23:59:59.999) en UTC,
 * calculado a partir de una fecha local en el timezone indicado.
 *
 * Caso de uso:
 * - Filtros de "hasta hoy"
 * - Queries tipo: createdAt <= endOfDayUtc(...)
 */
export function endOfDayUtc(date: Date, tz = DEFAULT_TZ): Date {
  return DateTime.fromJSDate(date, { zone: tz })
    .endOf("day")
    .toUTC()
    .toJSDate();
}

/**
 * Devuelve el rango completo del día en UTC,
 * partiendo de una fecha interpretada en el timezone local.
 *
 * Retorna:
 * - from: inicio del día (00:00:00.000) en UTC
 * - to: fin del día (23:59:59.999) en UTC
 *
 * Caso de uso:
 * - Queries por día exacto sin errores de timezone
 * - Dashboards / stats diarios
 */
export function dayRangeUtc(
  date: Date,
  tz = DEFAULT_TZ
): { from: Date; to: Date } {
  const dt = DateTime.fromJSDate(date, { zone: tz });

  return {
    from: dt.startOf("day").toUTC().toJSDate(),
    to: dt.endOf("day").toUTC().toJSDate(),
  };
}
