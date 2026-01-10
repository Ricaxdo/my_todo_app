import { describe, expect, it } from "vitest";
import {
  digitsOnly,
  formatPhone,
  normalizeEmail,
  passwordRulesFrom,
  validateConfirmPassword,
  validateEmail,
  validatePassword,
  validatePhone,
} from "./signup.utils";

describe("signup.utils", () => {
  describe("normalizeEmail", () => {
    it("trim + lowercase", () => {
      expect(normalizeEmail("  TeSt@Email.COM  ")).toBe("test@email.com");
    });
  });

  describe("digitsOnly", () => {
    it("remueve todo lo que no sea dígito", () => {
      expect(digitsOnly("(55) 12a-34_56!78")).toBe("5512345678");
    });
  });

  describe("formatPhone", () => {
    it("limita a 10 dígitos y aplica guiones", () => {
      expect(formatPhone("55123456789000")).toBe("551-234-5678");
    });

    it("formatea progresivo (<=3)", () => {
      expect(formatPhone("12")).toBe("12");
      expect(formatPhone("123")).toBe("123");
    });

    it("formatea progresivo (<=6)", () => {
      expect(formatPhone("1234")).toBe("123-4");
      expect(formatPhone("123456")).toBe("123-456");
    });

    it("quita caracteres no numéricos antes de formatear", () => {
      expect(formatPhone("(55) 123-4567")).toBe("551-234-567");
    });
  });

  describe("validateEmail", () => {
    it("vacío -> sin error", () => {
      expect(validateEmail("")).toBe("");
      expect(validateEmail("   ")).toBe("");
    });

    it("email inválido -> mensaje", () => {
      expect(validateEmail("no-es-email")).toBe("Email no es válido");
    });

    it("email válido -> sin error", () => {
      expect(validateEmail(" Test@Email.com ")).toBe("");
    });
  });

  describe("validatePhone", () => {
    it("vacío -> sin error", () => {
      expect(validatePhone("")).toBe("");
    });

    it("requiere 10 dígitos", () => {
      expect(validatePhone("55123")).toBe("Debe tener 10 dígitos");
      expect(validatePhone("55123456789")).toBe("Debe tener 10 dígitos");
      expect(validatePhone("55 1234 5678")).toBe(""); // 10 digits
    });
  });

  describe("validatePassword", () => {
    it("vacío -> sin error", () => {
      expect(validatePassword("")).toBe("");
    });

    it("si no cumple reglas -> mensaje", () => {
      expect(validatePassword("abc")).toBe("No cumple los requisitos");
      expect(validatePassword("abcdef")).toBe("No cumple los requisitos"); // sin mayúscula/número/special
      expect(validatePassword("Abcdef")).toBe("No cumple los requisitos"); // sin número/special
      expect(validatePassword("Abcdef1")).toBe("No cumple los requisitos"); // sin special
    });

    it("cumple reglas -> sin error", () => {
      expect(validatePassword("Abcdef1!")).toBe("");
    });
  });

  describe("validateConfirmPassword", () => {
    it("vacío -> sin error", () => {
      expect(validateConfirmPassword("Abcdef1!", "")).toBe("");
    });

    it("si no coincide -> mensaje", () => {
      expect(validateConfirmPassword("Abcdef1!", "Abcdef1?")).toBe(
        "No coinciden"
      );
    });

    it("si coincide -> sin error", () => {
      expect(validateConfirmPassword("Abcdef1!", "Abcdef1!")).toBe("");
    });
  });

  describe("passwordRulesFrom", () => {
    it("devuelve flags correctos", () => {
      expect(passwordRulesFrom("")).toEqual({
        minLen: false,
        uppercase: false,
        number: false,
        special: false,
      });

      expect(passwordRulesFrom("Abcdef1!")).toEqual({
        minLen: true,
        uppercase: true,
        number: true,
        special: true,
      });
    });
  });
});
