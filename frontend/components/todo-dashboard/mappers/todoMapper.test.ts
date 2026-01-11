import type { BackendTask } from "@/types/types";
import { describe, expect, it } from "vitest";
import { normalizeTasks, taskIdOf } from "./todoMapper";

function makeBackendTask(overrides: Partial<BackendTask> = {}): BackendTask {
  return {
    id: "t1",
    text: "Comprar leche",
    completed: false,
    priority: "low",
    category: "General",
    assignees: [],
    createdAt: "2026-01-10T10:00:00.000Z",
    updatedAt: undefined,
    dueDate: null,
    ...overrides,
  };
}

describe("todoMapper", () => {
  it("normalizeTasks: convierte fechas a Date", () => {
    const backend = [
      makeBackendTask({
        updatedAt: "2026-01-10T11:00:00.000Z",
        dueDate: "2026-01-12T00:00:00.000Z",
      }),
    ];

    const [task] = normalizeTasks(backend);

    expect(task.createdAt).toBeInstanceOf(Date);
    expect(task.updatedAt).toBeInstanceOf(Date);
    expect(task.dueDate).toBeInstanceOf(Date);
  });

  it("normalizeTasks: dueDate null si viene null", () => {
    const [task] = normalizeTasks([makeBackendTask({ dueDate: null })]);
    expect(task.dueDate).toBeNull();
  });

  it("taskIdOf: regresa id", () => {
    expect(taskIdOf(makeBackendTask({ id: "abc" }))).toBe("abc");
  });
});
