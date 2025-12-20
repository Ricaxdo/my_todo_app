"use client";

import { useNavigationUI } from "@/features/navigation/navigation-context";

export function RouteLoadingOverlay() {
  const { isNavigating } = useNavigationUI();

  if (!isNavigating) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-muted-foreground border-t-foreground animate-spin" />
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </div>
    </div>
  );
}
