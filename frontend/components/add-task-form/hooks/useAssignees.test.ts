import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Member } from "../types/addTaskForm.types";
import { useAssignees } from "./useAssignees";

describe("useAssignees", () => {
  const meId = "me-1";

  const members: Member[] = [
    { id: "u-1", name: "alice" },
    { id: "u-2", name: "bob" },
  ];

  it("en workspace personal siempre asigna solo a meId", () => {
    const setAssignees = vi.fn();

    renderHook(() =>
      useAssignees({
        isPersonalWorkspace: true,
        meId,
        members,
        assignees: ["u-1"], // intento inválido
        setAssignees,
      })
    );

    expect(setAssignees).toHaveBeenCalledWith([meId]);
  });

  it("toggleAll asigna a todos los miembros", () => {
    let assignees = [meId];

    const setAssignees = vi.fn((updater) => {
      assignees = typeof updater === "function" ? updater(assignees) : updater;
    });

    const { result } = renderHook(() =>
      useAssignees({
        isPersonalWorkspace: false,
        meId,
        members,
        assignees,
        setAssignees,
      })
    );

    act(() => {
      result.current.toggleAll();
    });

    expect(assignees).toEqual(expect.arrayContaining([meId, "u-1", "u-2"]));
  });

  it("nunca permite estado vacío al quitar el último asignado", () => {
    let assignees = [meId];

    const setAssignees = vi.fn((updater) => {
      assignees = typeof updater === "function" ? updater(assignees) : updater;
    });

    const { result } = renderHook(() =>
      useAssignees({
        isPersonalWorkspace: false,
        meId,
        members,
        assignees,
        setAssignees,
      })
    );

    act(() => {
      result.current.toggleAssignee(meId);
    });

    expect(assignees).toEqual([meId]);
  });
});
