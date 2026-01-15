"use client";

import { useAuth } from "@/state/auth/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

/**
 * RedirectIfAuth
 *
 * Protege páginas públicas (login / signup).
 * - Si el usuario YA está autenticado → redirige.
 * - Si NO está autenticado → renderiza children.
 *
 * Ejemplo:
 * <RedirectIfAuth>
 *   <LoginForm />
 * </RedirectIfAuth>
 */
export function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  /**
   * next:
   * - viene de ?next=/ruta
   * - fallback seguro a /dashboard
   */
  const next = useMemo(() => {
    const value = searchParams.get("next");
    return value && value.startsWith("/") ? value : "/dashboard";
  }, [searchParams]);

  /**
   * Cuando:
   * - ya terminó de cargar auth
   * - y el usuario está autenticado
   *
   * → lo sacamos de login/signup
   */
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(next);
    }
  }, [isLoading, isAuthenticated, router, next]);

  /**
   * Mientras auth carga:
   * - no mostramos nada
   * (evita parpadeos)
   */
  if (isLoading) return null;

  /**
   * Si está autenticado:
   * - ya se disparó redirect
   * - no renderizamos children
   */
  if (isAuthenticated) return null;

  /**
   * Usuario NO autenticado:
   * - renderizamos la página pública
   */
  return <>{children}</>;
}
