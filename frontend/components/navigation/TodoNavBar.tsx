"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useTodoDashboard } from "@/components/todo-dashboard/hooks/useTodoDashboard";
import { useAuth } from "@/state/auth/auth-context";
import { useWorkspaces } from "@/state/workspaces/workspace-context";

import { scrollToId } from "./nav-scroll";
import UserMenu from "./UserMenu";
import WorkspaceSwitch from "./WorkspaceSwitch";

import { authApi } from "@/services/auth/auth.api";

type TodoNavBarProps = {
  onOpenFooter: () => void;
};

/**
 * TodoNavBar
 * - Barra superior del dashboard de tareas
 * - Acciones: scroll a secciones (progress/tasks/home)
 * - Switch de workspace (si hay 2)
 * - Menú usuario (perfil + workspace modal + logout)
 */
export default function TodoNavBar({ onOpenFooter }: TodoNavBarProps) {
  const router = useRouter();

  const { logout, user, isLoading: isAuthLoading } = useAuth();
  const { resetDashboardState } = useTodoDashboard();

  const { workspaces, currentWorkspaceId, setCurrentWorkspaceId } =
    useWorkspaces();

  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  const displayName = useMemo(() => {
    if (!user) return "Cuenta";
    const full = `${user.name ?? ""} ${user.lastName ?? ""}`.trim();
    if (full) return full;
    return user.email ? user.email.split("@")[0] : "Cuenta";
  }, [user]);

  const sharedWorkspace = useMemo(() => {
    const extra = workspaces.find((w) => !w.isPersonal);
    if (!extra) return null;
    return { id: extra.id, name: extra.name };
  }, [workspaces]);

  function handleLogout() {
    logout();
    resetDashboardState();
    router.replace("/login");
  }

  function switchWorkspace(id: string) {
    if (!id || id === currentWorkspaceId) return;

    setCurrentWorkspaceId(id);

    scrollToId("home", { duration: 600, extraOffset: 12, navId: "app-navbar" });
  }

  async function handleDeleteAccount() {
    try {
      await authApi.deleteMe();

      // Limpieza local
      logout();
      resetDashboardState();

      router.replace("/login");
    } catch (err) {
      console.error(err);
      // aquí puedes meter toast/error banner si quieres
    }
  }

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-semibold text-lg tracking-tight hidden max-[370px]:inline">
          SF
        </span>
        <span className="font-semibold text-lg tracking-tight inline max-[370px]:hidden">
          StaiFocus
        </span>
      </div>

      {/* Acciones (centro) */}
      <button
        onClick={() => {
          onOpenFooter();
          scrollToId("footer", { duration: 900 });
        }}
        className="text-sm text-muted-foreground hover:text-foreground transition"
      >
        About it
      </button>

      <div className="flex items-center justify-end gap-0 flex-1 min-w-0">
        {/* Switch de workspace (o Home si no hay 2) */}
        <WorkspaceSwitch
          workspaces={workspaces}
          currentWorkspaceId={currentWorkspaceId}
          onSwitch={switchWorkspace}
          onHome={() => scrollToId("home", { duration: 1000, extraOffset: 12 })}
        />
      </div>

      {/* User menu + Workspace modal */}
      <UserMenu
        isLoading={isAuthLoading}
        displayName={displayName}
        email={user?.email}
        phone={user?.phone ?? null}
        sharedWorkspace={sharedWorkspace}
        workspaceOpen={workspaceOpen}
        setWorkspaceOpen={setWorkspaceOpen}
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
      />
    </nav>
  );
}
