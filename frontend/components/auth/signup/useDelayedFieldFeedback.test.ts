import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDelayedFieldFeedback } from "./useDelayedFieldFeedback";

describe("useDelayedFieldFeedback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("inicializa showFeedback en false para todas las keys", () => {
    const { result } = renderHook(() =>
      useDelayedFieldFeedback(["email", "password"] as const, 800)
    );

    expect(result.current.showFeedback).toEqual({
      email: false,
      password: false,
    });
  });

  it("schedule pone false y después del delay pone true y ejecuta cb", () => {
    const cb = vi.fn();

    const { result } = renderHook(() =>
      useDelayedFieldFeedback(["email"] as const, 800)
    );

    // programa feedback
    act(() => {
      result.current.schedule("email", cb);
    });

    // inmediatamente: sigue false
    expect(result.current.showFeedback.email).toBe(false);
    expect(cb).not.toHaveBeenCalled();

    // avanza el tiempo
    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(result.current.showFeedback.email).toBe(true);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("si schedule se llama otra vez antes del delay, cancela el timer anterior", () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    const { result } = renderHook(() =>
      useDelayedFieldFeedback(["email"] as const, 800)
    );

    act(() => {
      result.current.schedule("email", cb1);
    });

    // antes de que pase el tiempo, re-agenda
    act(() => {
      vi.advanceTimersByTime(400);
      result.current.schedule("email", cb2);
    });

    // si avanzamos otros 400ms (total 800 desde el primero), NO debe disparar cb1
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).not.toHaveBeenCalled(); // aún no llega a 800 desde el segundo

    // ahora sí completamos el segundo delay
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).toHaveBeenCalledTimes(1);
    expect(result.current.showFeedback.email).toBe(true);
  });
});
