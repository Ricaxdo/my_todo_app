"use client";

import { useAuth } from "@/state/auth/auth-context";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

function ProtectedShellSkeleton() {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:block w-64 border-r border-border p-4 space-y-3">
        <div className="h-6 w-32 rounded bg-muted animate-pulse" />
        <div className="h-4 w-40 rounded bg-muted animate-pulse" />
        <div className="h-4 w-36 rounded bg-muted animate-pulse" />
      </aside>

      {/* Main */}
      <main className="flex-1">
        <header className="h-14 border-b border-border flex items-center px-4">
          <div className="h-6 w-40 rounded bg-muted animate-pulse" />
        </header>

        <div className="p-4 space-y-4">
          <div className="h-10 w-64 rounded bg-muted animate-pulse" />
          <div className="h-24 w-full rounded bg-muted animate-pulse" />
          <div className="h-24 w-full rounded bg-muted animate-pulse" />
        </div>
      </main>
    </div>
  );
}

/**
 * RequireAuth
 *
 * Protege páginas privadas.
 * - Si NO está autenticado → redirect a /login
 * - Preserva la ruta original en ?next=
 *
 * Ejemplo:
 * <RequireAuth>
 *   <Dashboard />
 * </RequireAuth>
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * Construye nextUrl:
   * - pathname actual
   * - + query string si existe
   *
   * Ej:
   * /projects/123?tab=settings
   */
  const nextUrl = useMemo(() => {
    const qs = searchParams.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }, [pathname, searchParams]);

  /**
   * Si auth terminó de cargar y NO está autenticado:
   * → mandamos a login con ?next=
   */
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(nextUrl)}`);
    }
  }, [isLoading, isAuthenticated, router, nextUrl]);

  /**
   * Mientras auth carga:
   * - mostramos skeleton del layout protegido
   */
  if (isLoading) return <ProtectedShellSkeleton />;

  /**
   * Si NO está autenticado:
   * - ya se disparó redirect
   * - no renderizamos nada
   */
  if (!isAuthenticated) return null;

  /**
   * Usuario autenticado:
   * - renderizamos contenido protegido
   */
  return <>{children}</>;
}
