import { DateTime } from "luxon";

export const DEFAULT_TZ = "America/Mexico_City";

export function endOfDayUtc(date: Date, tz = DEFAULT_TZ): Date {
  return DateTime.fromJSDate(date, { zone: tz })
    .endOf("day")
    .toUTC()
    .toJSDate();
}

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
