"use client";

import { useNavigationUI } from "@/state/navigation/navigation-context";

/**
 * RouteLoadingOverlay
 *
 * Overlay global que se muestra durante transiciones de navegación:
 * - Login → dashboard
 * - Redirects protegidos
 * - Cambios de ruta programáticos (router.push/replace)
 *
 * Se controla vía NavigationUIContext (isNavigating).
 *
 * IMPORTANTE:
 * - Si `isNavigating` es false, no renderiza nada (no afecta layout).
 * - Vive fuera de páginas específicas para cubrir toda la app.
 */
export function RouteLoadingOverlay() {
  const { isNavigating } = useNavigationUI();

  // No renderizar nada si no hay navegación activa
  if (!isNavigating) return null;

  return (
    <div
      className="
        fixed inset-0 z-50
        bg-background/95 backdrop-blur-sm
        flex items-center justify-center
      "
    >
      <div className="flex flex-col items-center gap-3">
        {/* Spinner simple (no dependencias externas) */}
        <div
          className="
            h-8 w-8 rounded-full
            border-2 border-muted-foreground
            border-t-foreground
            animate-spin
          "
        />

        <p className="text-sm text-muted-foreground">Cargando…</p>
      </div>
    </div>
  );
}
