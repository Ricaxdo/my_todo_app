"use client";

import type { Me } from "@/services/auth/auth.api";
import { authApi } from "@/services/auth/auth.api";
import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * Payload mínimo para login.
 * Se mantiene separado del API para no acoplar UI ↔ backend directamente.
 */
type LoginPayload = { email: string; password: string };

/**
 * Payload de signup.
 * Campos opcionales según reglas actuales del backend.
 */
type SignupPayload = {
  name: string;
  lastName?: string;
  phone?: string;
  email: string;
  password: string;
};

/**
 * Contrato público del contexto de autenticación.
 * Define TODO lo que la app puede hacer/saber sobre auth.
 */
type AuthContextValue = {
  user: Me | null;
  isAuthenticated: boolean;

  // Bootstrap inicial (al cargar la app o refrescar sesión)
  isLoading: boolean;

  // Loading específico de acciones de auth (login / signup)
  isAuthLoading: boolean;

  // Error listo para mostrar en UI
  error: string | null;

  // Acciones
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;

  // Revalida sesión contra backend
  refreshMe: () => Promise<void>;

  // Limpia error manualmente (UX)
  clearError: () => void;
};

// Contexto base (null forzado para validar uso correcto)
const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Obtiene token desde storage.
 * Se protege contra SSR.
 */
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

/**
 * Normaliza errores de auth a mensajes de UX.
 * - 401: credenciales incorrectas
 * - otros: mensaje backend o fallback genérico
 */
function getErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null) {
    const e = err as { status?: number; message?: string };
    if (e.status === 401) return "Email o contraseña incorrectos.";
    return e.message || "Something went wrong";
  }
  return "Something went wrong";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Usuario autenticado (null = no sesión)
  const [user, setUser] = useState<Me | null>(null);

  // Loading inicial (bootstrap)
  const [isLoading, setIsLoading] = useState(true);

  // Loading de acciones de auth (login/signup)
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Error actual de auth
  const [error, setError] = useState<string | null>(null);

  // Estado derivado
  const isAuthenticated = !!user;

  const clearError = () => setError(null);

  /**
   * Revalida la sesión contra el backend.
   * - Si no hay token → limpia usuario
   * - Si falla → fuerza logout
   */
  const refreshMe = async () => {
    clearError();

    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      // Token inválido / expirado
      authApi.logout();
      setUser(null);
    }
  };

  /**
   * Login:
   * - intenta signin
   * - si es exitoso, revalida sesión (me)
   */
  const login = async (payload: LoginPayload) => {
    setIsAuthLoading(true);
    clearError();

    try {
      await authApi.signin(payload);
      await refreshMe();
    } catch (err: unknown) {
      setUser(null);
      setError(getErrorMessage(err));
      throw err; // permite que UI maneje flows (toast, etc.)
    } finally {
      setIsAuthLoading(false);
    }
  };

  /**
   * Signup:
   * - crea usuario
   * - NO inicia sesión automáticamente (según contrato actual del backend)
   */
  const signup = async (payload: SignupPayload) => {
    setIsAuthLoading(true);
    clearError();

    try {
      await authApi.signup(payload);
      // Si en el futuro lo hace, aquí guardarías token + refreshMe()
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  };

  /**
   * Logout explícito.
   * Limpia storage y estado local.
   */
  const logout = () => {
    authApi.logout();
    setUser(null);
    clearError();
  };

  /**
   * Bootstrap inicial de la app.
   * Se ejecuta una sola vez al montar el provider.
   */
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await refreshMe();
      setIsLoading(false);
    })();
    // refreshMe es estable por diseño (no se memoiza)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isLoading,
    isAuthLoading,
    error,
    login,
    signup,
    logout,
    refreshMe,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook seguro de consumo del contexto.
 * Falla explícitamente si se usa fuera del provider.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
}
