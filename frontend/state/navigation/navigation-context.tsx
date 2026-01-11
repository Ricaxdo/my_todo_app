"use client";

import { usePathname, useSearchParams } from "next/navigation";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * Contrato del contexto de navegación.
 * Expone únicamente lo necesario para UI:
 * - isNavigating → mostrar/ocultar loader
 * - start() → señal explícita de inicio de navegación
 */
type NavContextValue = {
  isNavigating: boolean;
  start: () => void;
};

const NavContext = createContext<NavContextValue | null>(null);

/**
 * Duración mínima del loader (ms).
 * Evita flickering en navegaciones muy rápidas.
 */
const MIN_DURATION = 600;

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Rutas actuales de Next.js
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Estado visible del loader de navegación
  const [isNavigating, setIsNavigating] = useState(false);

  // Marca de tiempo del inicio de navegación
  const startTimeRef = useRef<number | null>(null);

  /**
   * Señala el inicio explícito de una navegación.
   * Normalmente se llama antes de router.push().
   */
  const start = () => {
    startTimeRef.current = Date.now();
    setIsNavigating(true);
  };

  /**
   * Detiene el loader respetando la duración mínima.
   * Si la navegación fue muy rápida, se retrasa el stop
   * para mantener una UX consistente.
   */
  const stopWithDelay = () => {
    if (!startTimeRef.current) {
      setIsNavigating(false);
      return;
    }

    const elapsed = Date.now() - startTimeRef.current;
    const remaining = Math.max(0, MIN_DURATION - elapsed);

    setTimeout(() => {
      setIsNavigating(false);
      startTimeRef.current = null;
    }, remaining);
  };

  /**
   * Cuando cambia la ruta o los query params:
   * - asumimos que la navegación terminó
   * - detenemos el loader respetando el mínimo
   */
  useEffect(() => {
    stopWithDelay();
    // Dependencias controladas: queremos reaccionar solo a cambios de URL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams?.toString()]);

  // Valor memoizado para evitar renders innecesarios
  const value = useMemo(() => ({ isNavigating, start }), [isNavigating]);

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

/**
 * Hook seguro para consumir el estado de navegación.
 * Lanza error si se usa fuera del provider.
 */
export function useNavigationUI() {
  const ctx = useContext(NavContext);
  if (!ctx)
    throw new Error(
      "useNavigationUI must be used within <NavigationProvider />"
    );
  return ctx;
}
