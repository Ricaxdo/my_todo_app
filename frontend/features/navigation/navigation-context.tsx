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

type NavContextValue = {
  isNavigating: boolean;
  start: () => void;
};

const NavContext = createContext<NavContextValue | null>(null);

const MIN_DURATION = 600; // 👈 1 segundo

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isNavigating, setIsNavigating] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  const start = () => {
    startTimeRef.current = Date.now();
    setIsNavigating(true);
  };

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

  // cuando cambia la ruta → detener loader respetando el mínimo
  useEffect(() => {
    stopWithDelay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams?.toString()]);

  const value = useMemo(() => ({ isNavigating, start }), [isNavigating]);

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNavigationUI() {
  const ctx = useContext(NavContext);
  if (!ctx)
    throw new Error(
      "useNavigationUI must be used within <NavigationProvider />"
    );
  return ctx;
}
