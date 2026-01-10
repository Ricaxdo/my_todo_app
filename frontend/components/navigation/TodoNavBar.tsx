"use client";

import { BarChart3, ListChecks } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { useTodoDashboard } from "@/components/todo-dashboard/hooks/useTodoDashboard";
import { useAuth } from "@/state/auth/auth-context";
import { useWorkspaces } from "@/state/workspaces/workspace-context";

import { scrollToId } from "./nav-scroll";
import UserMenu from "./UserMenu";
import WorkspaceSwitch from "./WorkspaceSwitch";

/**
 * TodoNavBar
 * - Barra superior del dashboard de tareas
 * - Acciones: scroll a secciones (progress/tasks/home)
 * - Switch de workspace (si hay 2)
 * - Menú usuario (workspace modal + logout)
 */
export default function TodoNavBar() {
  const router = useRouter();

  const { logout, user, isLoading: isAuthLoading } = useAuth();
  const { resetDashboardState } = useTodoDashboard();

  const { workspaces, currentWorkspaceId, setCurrentWorkspaceId } =
    useWorkspaces();

  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  const displayName =
    user?.name?.trim() || (user?.email ? user.email.split("@")[0] : "Cuenta");

  function handleLogout() {
    // 1) limpiar auth
    logout();

    // 2) limpiar UI/state del dashboard
    resetDashboardState();

    // 3) redirigir
    router.replace("/login");
  }

  function switchWorkspace(id: string) {
    if (!id || id === currentWorkspaceId) return;

    setCurrentWorkspaceId(id);

    // UX: al cambiar de workspace, subimos a “home”
    scrollToId("home", { duration: 600, extraOffset: 12, navId: "app-navbar" });
  }

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-semibold text-lg tracking-tight hidden max-[350px]:inline">
          SF
        </span>
        <span className="font-semibold text-lg tracking-tight inline max-[350px]:hidden">
          StaiFocus
        </span>
      </div>

      {/* Acciones (centro) */}
      <div className="flex items-center justify-end gap-0 flex-1 min-w-0">
        <Button
          variant="ghost"
          onClick={() =>
            scrollToId("progress", { duration: 1000, extraOffset: 12 })
          }
        >
          <BarChart3 className="block sm:hidden h-5 w-5" />
          <span className="hidden sm:inline">Progress</span>
          <span className="sr-only">Progress</span>
        </Button>

        <Button
          variant="ghost"
          onClick={() =>
            scrollToId("tasks-anchor", { duration: 1000, extraOffset: 12 })
          }
          className="px-2 sm:px-3"
        >
          <ListChecks className="block sm:hidden h-5 w-5" />
          <span className="hidden sm:inline">Tasks</span>
          <span className="sr-only">Tasks</span>
        </Button>

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
        workspaceOpen={workspaceOpen}
        setWorkspaceOpen={setWorkspaceOpen}
        onLogout={handleLogout}
      />
    </nav>
  );
}
