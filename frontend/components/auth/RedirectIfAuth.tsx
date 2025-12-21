"use client";

import { useAuth } from "@/features/auth/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

export function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = useMemo(
    () => searchParams.get("next") || "/dashboard",
    [searchParams]
  );

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(next);
    }
  }, [isLoading, isAuthenticated, router, next]);

  if (isLoading) return null;
  if (isAuthenticated) return null;

  return <>{children}</>;
}
