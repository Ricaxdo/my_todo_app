"use client";

import { useAuth } from "@/features/auth/auth-context";

export default function DashboardClient() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="p-6">Cargando sesión...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        Hola, {user?.name ?? "usuario"} 👋
      </p>
    </div>
  );
}
