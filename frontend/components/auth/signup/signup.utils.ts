// components/auth/signup/signup.utils.ts
export type SignupFieldKey =
  | "name"
  | "lastName"
  | "phone"
  | "email"
  | "password"
  | "confirmPassword";

export const NAME_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function formatPhone(value: string) {
  const digits = digitsOnly(value).slice(0, 10);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;

  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function validateEmail(value: string) {
  const clean = normalizeEmail(value);
  if (!clean) return "";
  return /^\S+@\S+\.\S+$/.test(clean) ? "" : "Email no es válido";
}

export function validatePhone(value: string) {
  const digits = digitsOnly(value);
  if (!digits) return "";
  return /^\d{10}$/.test(digits) ? "" : "Debe tener 10 dígitos";
}

export function validatePassword(value: string) {
  if (!value) return "";
  const rulesOk =
    value.length >= 6 &&
    /[A-Z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value);

  return rulesOk ? "" : "No cumple los requisitos";
}

export function validateConfirmPassword(pwd: string, confirm: string) {
  if (!confirm) return "";
  return confirm !== pwd ? "No coinciden" : "";
}

export function passwordRulesFrom(pwd: string) {
  return {
    minLen: pwd.length >= 6,
    uppercase: /[A-Z]/.test(pwd),
    number: /\d/.test(pwd),
    special: /[^A-Za-z0-9]/.test(pwd),
  };
}
