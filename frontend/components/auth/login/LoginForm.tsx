"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useMemo, useState } from "react";

import AuthShell from "@/components/auth/AuthShell";
import PasswordField from "@/components/auth/PasswordField";

import { AppLink } from "@/components/ui/AppLink";
import { Button } from "@/components/ui/button";
import ErrorBanner from "@/components/ui/ErrorBanner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAuth } from "@/state/auth/auth-context";
import { useNavigationUI } from "@/state/navigation/navigation-context";

import { normalizeEmail, safeNext } from "./login.utils";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // UI feedback global (e.g. barra/overlay de navegación) + estado de auth
  const { start } = useNavigationUI();
  const { login, isAuthLoading, error, clearError } = useAuth();

  // Destino post-login (whitelist / saneado para evitar open-redirects)
  const next = useMemo(
    () => safeNext(searchParams.get("next")),
    [searchParams]
  );

  // Estado local del form (controlado)
  const [form, setForm] = useState({ email: "", password: "" });

  // “Single source” para deshabilitar inputs/botón mientras autentica
  const disabled = isAuthLoading;

  function updateField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    // Si el usuario vuelve a teclear, limpiamos error previo para no “pelear” con el UI
    if (error) clearError();
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Al enviar, aseguramos que el banner muestre solo errores “fresh”
    if (error) clearError();

    try {
      await login({
        email: normalizeEmail(form.email),
        password: form.password,
      });

      // Feedback inmediato de navegación y redirección sin dejar “back” al login
      start();
      router.replace(next);
    } catch {
      // login() maneja el error en el contexto; aquí solo evitamos navegar.
    }
  }

  return (
    <AuthShell
      title="Bienvenido"
      subtitle="Accede a tus tareas y mantente enfocado."
      maxWidthClassName="max-w-md"
    >
      {/* Error global del flujo de auth */}
      <ErrorBanner
        title="No se pudo iniciar sesión"
        message={error}
        onClose={clearError}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>

          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            required
            disabled={disabled}
            className="h-11"
            autoComplete="email"
            inputMode="email"
          />
        </div>

        {/* Link recuperar password */}
        <div className="flex mb-[-20px] justify-end">
          <AppLink
            href="/forgot-password"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </AppLink>
        </div>

        {/* Password (input compuesto: label + toggle visibilidad + reglas, etc.) */}
        <PasswordField
          id="password"
          label="Contraseña"
          value={form.password}
          onChange={(v) => updateField("password", v)}
          disabled={disabled}
          required
          autoComplete="current-password"
        />

        {/* Submit */}
        <Button
          type="submit"
          className="w-full h-11 font-medium"
          size="lg"
          disabled={disabled}
        >
          {isAuthLoading ? "Iniciando..." : "Iniciar sesión"}
        </Button>
      </form>

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          {"¿No tienes una cuenta? "}
          <AppLink
            href="/signup"
            className="text-foreground hover:text-primary font-medium transition-colors"
          >
            Regístrate
          </AppLink>
        </p>
      </div>
    </AuthShell>
  );
}
