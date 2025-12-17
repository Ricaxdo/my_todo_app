"use client";

import type { Me } from "@/features/auth/auth";
import { authApi } from "@/features/auth/auth"; // donde dejaste authApi
import type { ApiError } from "@/lib/api/clients";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type LoginPayload = { email: string; password: string };

type AuthContextValue = {
  user: Me | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function getErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as ApiError).message);
  }
  return "Something went wrong";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  const clearError = () => setError(null);

  const refreshMe = async () => {
    clearError();

    // Si no hay token, no pegues al backend
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const me = await authApi.me();
      setUser(me);
    } catch (err: unknown) {
      // si falla (401 u otro), apiFetch ya pudo limpiar token
      setUser(null);
      setError(getErrorMessage(err));
    }
  };

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    clearError();

    try {
      await authApi.signin(payload); // guarda token
      await refreshMe(); // trae user
    } catch (err: unknown) {
      setUser(null);
      setError(getErrorMessage(err));
      throw err; // opcional: para que el form también reaccione
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout(); // limpia token
    setUser(null);
    clearError();
  };

  // Al montar la app: intenta recuperar sesión
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await refreshMe();
      setIsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      error,
      login,
      logout,
      refreshMe,
      clearError,
    }),
    [user, isAuthenticated, isLoading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
}
