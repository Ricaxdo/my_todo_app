import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { scrollToId } from "./nav-scroll";

describe("scrollToId", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("no hace nada si el elemento no existe", () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});

    // RAF no debería importar aquí
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);

    scrollToId("no-existe");
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("hace scroll cuando el elemento existe (evita recursión infinita)", () => {
    const scrollToSpy = vi
      .spyOn(window, "scrollTo")
      .mockImplementation(() => {});

    // RAF: solo corre 1 frame
    let rafCalls = 0;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCalls += 1;
      if (rafCalls === 1) cb(1000);
      return 1;
    });

    // Navbar fake
    const nav = document.createElement("div");
    nav.id = "app-navbar";
    Object.defineProperty(nav, "offsetHeight", { value: 64 });
    document.body.appendChild(nav);

    // Target fake
    const target = document.createElement("div");
    target.id = "section";
    target.getBoundingClientRect = () => ({ top: 300 } as DOMRect);
    document.body.appendChild(target);

    // Scroll inicial
    Object.defineProperty(window, "scrollY", {
      value: 100,
      configurable: true,
    });

    // Duration = 900 por defecto, pero como solo corremos 1 frame, no importa.
    scrollToId("section");

    expect(scrollToSpy).toHaveBeenCalledTimes(1);
    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });
});
