"use client";

import { useAuth } from "@/features/auth/auth-context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

function ProtectedShellSkeleton() {
  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:block w-64 border-r border-border p-4 space-y-3">
        <div className="h-6 w-32 rounded bg-muted animate-pulse" />
        <div className="h-4 w-40 rounded bg-muted animate-pulse" />
        <div className="h-4 w-36 rounded bg-muted animate-pulse" />
      </aside>

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

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) return <ProtectedShellSkeleton />;
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
