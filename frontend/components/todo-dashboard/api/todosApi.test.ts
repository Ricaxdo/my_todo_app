import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createTodo,
  deleteTodo,
  getTodos,
  todosBaseForWorkspace,
  updateTodo,
} from "./todosApi";

function mockFetchOnce(
  fetchMock: ReturnType<typeof vi.fn>,
  ok: boolean,
  status: number,
  jsonValue: unknown,
  jsonReject = false
) {
  const res = {
    ok,
    status,
    json: jsonReject
      ? vi.fn().mockRejectedValue(new Error("bad json"))
      : vi.fn().mockResolvedValue(jsonValue),
  } as unknown as Response;

  fetchMock.mockResolvedValueOnce(res);
}

describe("todosApi", () => {
  const originalTZ = Intl.DateTimeFormat;

  beforeEach(() => {
    vi.restoreAllMocks();

    // mock fetch
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    localStorage.clear();

    // timezone estable
    (Intl as unknown as { DateTimeFormat: unknown }).DateTimeFormat = (() => ({
      resolvedOptions: () => ({ timeZone: "America/Mexico_City" }),
    })) as unknown as typeof Intl.DateTimeFormat;
  });

  afterEach(() => {
    (Intl as unknown as { DateTimeFormat: unknown }).DateTimeFormat =
      originalTZ as unknown as typeof Intl.DateTimeFormat;
  });

  it("todosBaseForWorkspace: null -> null", () => {
    expect(todosBaseForWorkspace(null)).toBeNull();
  });

  it("todosBaseForWorkspace: arma base con workspace", () => {
    expect(todosBaseForWorkspace("w1")).toContain("/workspaces/w1/todos");
  });

  it("getTodos: manda query date y headers (Authorization si hay token)", async () => {
    localStorage.setItem("token", "abc");

    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    mockFetchOnce(fetchMock, true, 200, []);

    const base = "http://x/workspaces/w1/todos";
    await getTodos(base, "2026-01-10");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(url).toBe(`${base}?date=2026-01-10`);
    expect(init.headers).toMatchObject({
      Authorization: "Bearer abc",
      "X-Timezone": "America/Mexico_City",
    });
  });

  it("getTodos: si JSON viene vacío/mal -> error de array", async () => {
    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    mockFetchOnce(fetchMock, true, 200, null, true);

    await expect(getTodos("base", "2026-01-10")).rejects.toThrow(
      "Expected array from todos endpoint"
    );
  });

  it("getTodos: si no ok, lanza y limpia token en 401/403", async () => {
    localStorage.setItem("token", "abc");

    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    mockFetchOnce(fetchMock, false, 401, { message: "Invalid session" });

    await expect(getTodos("base", "2026-01-10")).rejects.toThrow(
      "Invalid session"
    );
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("createTodo: manda POST con Content-Type json y body stringificado", async () => {
    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    mockFetchOnce(fetchMock, true, 200, { id: "t1" });

    await createTodo("base", { text: "x" });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({
      "Content-Type": "application/json",
      "X-Timezone": "America/Mexico_City",
    });
    expect(init.body).toBe(JSON.stringify({ text: "x" }));
  });

  it("updateTodo: si no ok lanza error", async () => {
    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    mockFetchOnce(fetchMock, false, 500, { message: "Oops" });

    await expect(
      updateTodo("base", "id1", { completed: true })
    ).rejects.toThrow("Oops");
  });

  it("deleteTodo: si no ok lanza error", async () => {
    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    mockFetchOnce(fetchMock, false, 500, { error: "Nope" });

    await expect(deleteTodo("base", "id1")).rejects.toThrow("Nope");
  });
});
