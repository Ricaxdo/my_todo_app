"use client";

import { useAuth } from "@/features/auth/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const next = searchParams.get("next") || "/dashboard";
      router.replace(next);
    }
  }, [isLoading, isAuthenticated, router, searchParams]);

  if (isLoading) return null;
  if (isAuthenticated) return null;

  return <>{children}</>;
}
