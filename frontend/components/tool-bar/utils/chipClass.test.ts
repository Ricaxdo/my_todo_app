import { describe, expect, it } from "vitest";
import { chipClass } from "./toolbar.utils";

describe("chipClass", () => {
  it("incluye base + variante activa", () => {
    const cls = chipClass(true);

    expect(cls).toContain("flex items-center");
    expect(cls).toContain("bg-white");
    expect(cls).toContain("text-black");
  });

  it("incluye base + variante inactiva", () => {
    const cls = chipClass(false);

    expect(cls).toContain("flex items-center");
    expect(cls).toContain("bg-secondary/50");
    expect(cls).toContain("text-muted-foreground");
  });
});
