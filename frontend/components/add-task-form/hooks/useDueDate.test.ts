import { act, renderHook } from "@testing-library/react";
import { addWeeks, startOfDay } from "date-fns";
import { describe, expect, it, vi } from "vitest";

import { useDueDate } from "./useDueDate";

describe("useDueDate", () => {
  it("today es inicio del día", () => {
    const setDueDate = vi.fn();

    const { result } = renderHook(() =>
      useDueDate({
        dueDate: new Date(),
        setDueDate,
      })
    );

    expect(result.current.today.getTime()).toBe(
      startOfDay(new Date()).getTime()
    );
  });

  it("week es exactamente 1 semana después de today", () => {
    const setDueDate = vi.fn();

    const { result } = renderHook(() =>
      useDueDate({
        dueDate: new Date(),
        setDueDate,
      })
    );

    act(() => {
      result.current.setDueDateOption("week");
    });

    expect(result.current.effectiveDate.getTime()).toBe(
      addWeeks(result.current.today, 1).getTime()
    );
  });

  it("no llama setDueDate si la fecha no cambia", () => {
    const today = startOfDay(new Date());
    const setDueDate = vi.fn();

    renderHook(() =>
      useDueDate({
        dueDate: today,
        setDueDate,
      })
    );

    expect(setDueDate).not.toHaveBeenCalled();
  });
});
