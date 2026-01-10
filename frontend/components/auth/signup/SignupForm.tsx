"use client";

import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";

import { AppLink } from "@/components/ui/AppLink";
import ErrorBanner from "@/components/ui/ErrorBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";

import { useAuth } from "@/state/auth/auth-context";

// Usa shell compartido (fondo + card + brand + glows + title/subtitle)
import AuthShell from "../AuthShell";

// PasswordField
import PasswordField from "../PasswordField";

//  Signup pieces
import PasswordRulesPopoverContent from "./PasswordRulesPopoverContent";
import {
  NAME_REGEX,
  type SignupFieldKey,
  digitsOnly,
  formatPhone,
  normalizeEmail,
  passwordRulesFrom,
  validateConfirmPassword,
  validateEmail,
  validatePassword,
  validatePhone,
} from "./signup.utils";
import { useDelayedFieldFeedback } from "./useDelayedFieldFeedback";

const FIELD_KEYS: readonly SignupFieldKey[] = [
  "name",
  "lastName",
  "phone",
  "email",
  "password",
  "confirmPassword",
] as const;

export default function SignupForm() {
  const router = useRouter();
  const { signup, isAuthLoading, error, clearError } = useAuth();

  // -------------------------
  // Form state
  // -------------------------
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState(""); // formateado 000-000-0000
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Errores por campo (string vacío = sin error)
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Popover de reglas de password
  const [passwordOpen, setPasswordOpen] = useState(false);

  // Feedback con delay por campo (bordes verde/rojo)
  const { showFeedback, schedule } = useDelayedFieldFeedback(FIELD_KEYS, 800);

  const passwordRules = passwordRulesFrom(password);

  // -------------------------
  // UI helpers
  // -------------------------
  function inputBorderClass(
    key: SignupFieldKey,
    hasValue: boolean,
    err?: string
  ) {
    const base = "transition-colors duration-500 ease-in-out border-border";
    if (!hasValue || !showFeedback[key]) return base;
    if (err) return `${base} border-red-500`;
    return `${base} border-green-500`;
  }

  // -------------------------
  // Submit validation (por si no esperaron 800ms)
  // -------------------------
  function validateForm() {
    const newErrors: Record<string, string> = {};

    const cleanName = name.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = normalizeEmail(email);
    const cleanPhone = digitsOnly(phone);

    // Mantengo tus mensajes actuales
    if (!cleanName) newErrors.name = "Solo letras";
    if (!cleanLastName) newErrors.lastName = "Solo letras";

    if (!cleanEmail) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(cleanEmail))
      newErrors.email = "Email no es válido";

    if (!cleanPhone) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(cleanPhone))
      newErrors.phone = "Debe tener 10 dígitos";

    if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (password !== confirmPassword)
      newErrors.confirmPassword = "No coinciden";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // -------------------------
  // Submit
  // -------------------------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (error) clearError();
    if (!validateForm()) return;

    try {
      await signup({
        name: name.trim(),
        lastName: lastName.trim(),
        phone: digitsOnly(phone),
        email: normalizeEmail(email),
        password,
      });

      router.replace("/login");
    } catch {
      // Si tu signup() ya setea `error`, aquí no hacemos nada.
      // Importante: NO navegar.
    }
  }

  // -------------------------
  // Field handlers (con delay)
  // -------------------------
  function onName(v: string) {
    clearError();
    setName(v);

    schedule("name", () => {
      if (!v) return setErrors((p) => ({ ...p, name: "" }));
      setErrors((p) => ({
        ...p,
        name: NAME_REGEX.test(v) ? "" : "Solo esta permitido letras",
      }));
    });
  }

  function onLastName(v: string) {
    clearError();
    setLastName(v);

    schedule("lastName", () => {
      if (!v) return setErrors((p) => ({ ...p, lastName: "" }));
      setErrors((p) => ({
        ...p,
        lastName: NAME_REGEX.test(v) ? "" : "Solo esta permitido letras",
      }));
    });
  }

  function onPhone(v: string) {
    clearError();

    const formatted = formatPhone(v);
    setPhone(formatted);

    schedule("phone", () => {
      setErrors((p) => ({ ...p, phone: validatePhone(formatted) }));
    });
  }

  function onEmail(v: string) {
    clearError();
    setEmail(v);

    schedule("email", () => {
      setErrors((p) => ({ ...p, email: validateEmail(v) }));
    });
  }

  // -------------------------
  // Form enabled
  // -------------------------
  const isFormValid =
    name.trim().length > 0 &&
    lastName.trim().length > 0 &&
    digitsOnly(phone).length === 10 &&
    email.trim().length > 0 &&
    password.length > 0 &&
    confirmPassword.length > 0 &&
    !errors.name &&
    !errors.lastName &&
    !errors.phone &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword &&
    passwordRules.minLen &&
    passwordRules.uppercase &&
    passwordRules.number &&
    passwordRules.special &&
    password === confirmPassword;

  // ✅ Aquí está LA clave:
  // AuthShell ya renderiza todo el layout externo.
  return (
    <AuthShell
      title="Crea tu cuenta"
      subtitle="Únete a Focus y comienza a gestionar tus tareas"
      maxWidthClassName="max-w-150"
    >
      <ErrorBanner
        title="No se pudo crear la cuenta"
        message={error}
        onClose={clearError}
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 min-[437px]:grid-cols-2">
          {/* Left */}
          <div className="space-y-2 flex flex-col w-full">
            {/* Nombre */}
            <div className="flex flex-row justify-between">
              <Label htmlFor="name" className="text-sm font-medium">
                Nombre
              </Label>
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            <Input
              id="name"
              value={name}
              onChange={(e) => onName(e.target.value)}
              required
              disabled={isAuthLoading}
              placeholder="Juanito"
              className={`h-11 ${inputBorderClass(
                "name",
                !!name,
                errors.name
              )}`}
              autoComplete="given-name"
            />

            {/* Apellido */}
            <div className="flex flex-row justify-between">
              <Label htmlFor="lastName" className="text-sm font-medium">
                Apellido
              </Label>
              {errors.lastName && (
                <p className="text-xs text-red-500">{errors.lastName}</p>
              )}
            </div>

            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => onLastName(e.target.value)}
              required
              disabled={isAuthLoading}
              placeholder="Peregrino"
              className={`h-11 ${inputBorderClass(
                "lastName",
                !!lastName,
                errors.lastName
              )}`}
              autoComplete="family-name"
            />

            {/* Email */}
            <div className="flex flex-row justify-between">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => onEmail(e.target.value)}
              required
              disabled={isAuthLoading}
              placeholder="you@example.com"
              className={`h-11 ${inputBorderClass(
                "email",
                !!email,
                errors.email
              )}`}
              autoComplete="email"
              inputMode="email"
            />
          </div>

          {/* Right */}
          <div className="space-y-2 flex flex-col w-full">
            {/* Teléfono */}
            <div className="flex flex-row justify-between">
              <Label htmlFor="phone" className="text-sm font-medium">
                Número de teléfono
              </Label>
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone}</p>
              )}
            </div>

            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => onPhone(e.target.value)}
              required
              disabled={isAuthLoading}
              placeholder="000-000-0000"
              className={`h-11 ${inputBorderClass(
                "phone",
                !!phone,
                errors.phone
              )}`}
              autoComplete="tel"
              inputMode="tel"
            />

            {/* Password + Popover reglas */}
            <Popover open={passwordOpen} onOpenChange={setPasswordOpen}>
              <PopoverAnchor asChild>
                <div>
                  <PasswordField
                    id="password"
                    label="Contraseña"
                    value={password}
                    onChange={(v) => {
                      clearError();
                      setPassword(v);

                      schedule("password", () => {
                        setErrors((p) => ({
                          ...p,
                          password: validatePassword(v),
                          confirmPassword: validateConfirmPassword(
                            v,
                            confirmPassword
                          ),
                        }));
                      });
                    }}
                    disabled={isAuthLoading}
                    required
                    autoComplete="new-password"
                    error={errors.password}
                    inputClassName={inputBorderClass(
                      "password",
                      !!password,
                      errors.password
                    )}
                    onFocus={() => setPasswordOpen(true)}
                    onBlur={(e) => {
                      const next = e.relatedTarget as HTMLElement | null;
                      // Si el blur va al botón del ojito, no cierres el popover
                      if (next?.dataset?.pwToggle === "true") return;
                      setPasswordOpen(false);
                    }}
                  />
                </div>
              </PopoverAnchor>

              <PopoverContent
                align="start"
                side="top"
                sideOffset={8}
                className="w-72 bg-black text-white rounded-md shadow-lg p-4"
                onOpenAutoFocus={(e) => e.preventDefault()}
                onInteractOutside={(e) => {
                  const target = e.target as HTMLElement;
                  if (target?.closest("[data-pw-toggle='true']"))
                    e.preventDefault();
                }}
              >
                <PasswordRulesPopoverContent rules={passwordRules} />
              </PopoverContent>
            </Popover>

            {/* Confirm Password */}
            <PasswordField
              id="confirmPassword"
              label="Confirmar Contraseña"
              value={confirmPassword}
              onChange={(v) => {
                clearError();
                setConfirmPassword(v);

                schedule("confirmPassword", () => {
                  setErrors((p) => ({
                    ...p,
                    confirmPassword: validateConfirmPassword(password, v),
                  }));
                });
              }}
              disabled={isAuthLoading}
              required
              autoComplete="new-password"
              error={errors.confirmPassword}
              inputClassName={inputBorderClass(
                "confirmPassword",
                !!confirmPassword,
                errors.confirmPassword
              )}
            />
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={!isFormValid || isAuthLoading}
          className="
            w-full h-11 font-medium
            transition-all duration-300
            disabled:opacity-20
            disabled:cursor-not-allowed
            disabled:pointer-events-none
          "
        >
          {isAuthLoading ? "Creando..." : "Crea tu cuenta"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          {"¿Ya tienes una cuenta? "}
          <AppLink
            href="/login"
            className="text-foreground hover:text-primary font-medium transition-colors"
          >
            Inicia sesión
          </AppLink>
        </p>
      </div>
    </AuthShell>
  );
}
