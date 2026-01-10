import { describe, expect, it } from "vitest";
import { efficiencyStyles, startOfDay } from "./todoStats.utils";

describe("startOfDay", () => {
  it("normaliza a 00:00:00.000 y no muta el Date original", () => {
    const original = new Date(2026, 0, 10, 15, 30, 45, 123);
    const copyMs = original.getTime();

    const x = startOfDay(original);

    expect(original.getTime()).toBe(copyMs); // no muta
    expect(x.getHours()).toBe(0);
    expect(x.getMinutes()).toBe(0);
    expect(x.getSeconds()).toBe(0);
    expect(x.getMilliseconds()).toBe(0);
  });
});

describe("efficiencyStyles", () => {
  it(">= 80: emerald", () => {
    expect(efficiencyStyles(80)).toEqual({
      text: "text-emerald-500",
      bg: "bg-emerald-500/20",
      bar: "bg-emerald-500",
    });
  });

  it(">= 50 y < 80: amber", () => {
    expect(efficiencyStyles(50)).toEqual({
      text: "text-amber-500",
      bg: "bg-amber-500/20",
      bar: "bg-amber-500",
    });
    expect(efficiencyStyles(79.9)).toEqual({
      text: "text-amber-500",
      bg: "bg-amber-500/20",
      bar: "bg-amber-500",
    });
  });

  it("< 50: red", () => {
    expect(efficiencyStyles(49.99)).toEqual({
      text: "text-red-500",
      bg: "bg-red-500/20",
      bar: "bg-red-500",
    });
  });
});
