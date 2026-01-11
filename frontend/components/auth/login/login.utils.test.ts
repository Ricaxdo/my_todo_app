import { describe, expect, it } from "vitest";
import { normalizeEmail, safeNext } from "./login.utils";

describe("login.utils", () => {
  describe("normalizeEmail", () => {
    it("trim + lowercase", () => {
      expect(normalizeEmail("  TeSt@Email.COM  ")).toBe("test@email.com");
    });

    it("mantiene string vacío como vacío", () => {
      expect(normalizeEmail("   ")).toBe("");
    });
  });

  describe("safeNext", () => {
    it("si next es null -> /dashboard", () => {
      expect(safeNext(null)).toBe("/dashboard");
    });

    it("si next no empieza con / -> /dashboard", () => {
      expect(safeNext("http://evil.com")).toBe("/dashboard");
      expect(safeNext("dashboard")).toBe("/dashboard");
    });

    it("si next empieza con / -> se respeta", () => {
      expect(safeNext("/todos")).toBe("/todos");
      expect(safeNext("/dashboard?tab=activity")).toBe(
        "/dashboard?tab=activity"
      );
    });
  });
});
