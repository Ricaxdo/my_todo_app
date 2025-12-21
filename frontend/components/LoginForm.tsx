"use client";

import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAuth } from "@/features/auth/auth-context";
import { useNavigationUI } from "@/features/navigation/navigation-context";

import { AppLink } from "./AppLink";
import ErrorBanner from "./ErrorBanner";

export default function LoginForm() {
  const router = useRouter();
  const { start } = useNavigationUI();
  const { login, isAuthLoading, error, clearError } = useAuth();

  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login({
        email: email.trim().toLowerCase(),
        password,
      });

      start();
      router.replace(next);
    } catch {
      // ✅ El error ya lo setea el AuthContext
      // No necesitas setear nada aquí
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-grid-white pointer-events-none opacity-[0.05]" />

      <div className="relative w-full max-w-md shadow-[0_0_24px_rgba(255,255,255,0.2)] rounded-2xl">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-b from-white via-zinc-200 to-zinc-400 shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-zinc-700" />
              </div>

              <h1 className="text-4xl md:text-4xl font-extrabold bg-gradient-to-b from-white via-gray-200 to-gray-600 bg-clip-text text-transparent tracking-tight">
                StaiFocus
              </h1>
            </div>
          </div>

          <div className="text-center mb-3">
            <h2 className="text-2xl font-semibold mb-2 text-balance">
              Bienvenido
            </h2>
            <p className="text-muted-foreground text-pretty">
              Accede a tus tareas y mantente enfocado.
            </p>
          </div>

          <ErrorBanner
            title="No se pudo iniciar sesión"
            message={error}
            onClose={clearError}
          />

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError();
                }}
                required
                disabled={isAuthLoading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium flex-1"
                >
                  Contraseña
                </Label>
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex justify-end"
                >
                  <Label className="max-[333px]:text-xs">
                    ¿Olvidaste tu contraseña?
                  </Label>
                </button>
              </div>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError();
                  }}
                  required
                  disabled={isAuthLoading}
                  className="h-11 pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isAuthLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-medium"
              size="lg"
              disabled={isAuthLoading}
            >
              {isAuthLoading ? "Iniciando..." : "Iniciar sesión"}
            </Button>
          </form>

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
        </div>

        <div className="absolute -top-24 -right-24 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      </div>
    </div>
  );
}
