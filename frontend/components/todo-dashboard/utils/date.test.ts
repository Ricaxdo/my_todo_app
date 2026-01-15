import { describe, expect, it } from "vitest";
import { startOfDay, toDayStringLocal } from "./date";

describe("date utils", () => {
  it("startOfDay: pone la hora en 00:00:00.000 local", () => {
    const d = new Date(2026, 0, 10, 15, 30, 45, 123);
    const x = startOfDay(d);

    expect(x.getHours()).toBe(0);
    expect(x.getMinutes()).toBe(0);
    expect(x.getSeconds()).toBe(0);
    expect(x.getMilliseconds()).toBe(0);
  });

  it("toDayStringLocal: formato yyyy-MM-dd", () => {
    const d = new Date(2026, 0, 5); // Jan 5 2026
    expect(toDayStringLocal(d)).toBe("2026-01-05");
  });
});
