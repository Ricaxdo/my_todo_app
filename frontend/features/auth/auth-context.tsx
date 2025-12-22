"use client";

import type { Me } from "@/features/auth/auth-api";
import { authApi } from "@/features/auth/auth-api";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type LoginPayload = { email: string; password: string };

type SignupPayload = {
  name: string;
  lastName?: string;
  phone?: string;
  email: string;
  password: string;
};

type AuthContextValue = {
  user: Me | null;
  isAuthenticated: boolean;

  // bootstrap (al cargar app / refresh session)
  isLoading: boolean;

  // acciones de auth (login/signup/etc)
  isAuthLoading: boolean;

  error: string | null;

  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
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
  if (typeof err === "object" && err !== null) {
    const e = err as { status?: number; message?: string };
    if (e.status === 401) return "Email o contraseña incorrectos.";
    return e.message || "Something went wrong";
  }
  return "Something went wrong";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  const clearError = () => setError(null);

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
      authApi.logout();
      setUser(null);
    }
  };

  const login = async (payload: LoginPayload) => {
    setIsAuthLoading(true);
    clearError();

    try {
      await authApi.signin(payload);
      await refreshMe();
    } catch (err: unknown) {
      setUser(null);
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const signup = async (payload: SignupPayload) => {
    setIsAuthLoading(true);
    clearError();

    try {
      await authApi.signup(payload);
      // 👇 OJO: tu backend no devuelve token en signup, por eso NO hacemos refreshMe aquí
      // si en el futuro devuelve token, aquí lo guardarías y luego refreshMe()
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    clearError();
  };

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
      isAuthLoading,
      error,
      login,
      signup,
      logout,
      refreshMe,
      clearError,
    }),
    [user, isAuthenticated, isLoading, isAuthLoading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
}
