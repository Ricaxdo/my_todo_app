"use client";

import { useMemo, useState } from "react";

import { useTodoDashboard } from "@/app/hooks/useTodoDashboard";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/auth-context";
import { WorkspaceModal } from "@/features/workspaces/WorkspaceModal";
import { useWorkspaces } from "@/features/workspaces/workspace-context";
import { cn } from "@/lib/utils";

import {
  BarChart3,
  Home,
  ListChecks,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getNavOffset(extra = 12) {
  const nav = document.getElementById("app-navbar");
  const h = nav?.offsetHeight ?? 0;
  return h + extra;
}

function scrollToId(id: string, duration = 900, extraOffset = 16) {
  const el = document.getElementById(id);
  if (!el) return;

  const offset = getNavOffset(extraOffset);

  const startY = window.scrollY;
  const rect = el.getBoundingClientRect();
  const targetY = startY + rect.top - offset;

  const startTime = performance.now();

  function step(now: number) {
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / duration);
    const eased = easeInOutCubic(t);

    window.scrollTo(0, startY + (targetY - startY) * eased);

    if (t < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

export default function TodoNavBar() {
  const router = useRouter();
  const { logout, user, isLoading } = useAuth();
  const { logout: logoutTasks } = useTodoDashboard();

  const { workspaces, currentWorkspaceId, setCurrentWorkspaceId } =
    useWorkspaces();

  // ✅ estado del modal
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  const handleLogout = () => {
    logout();
    logoutTasks();
    router.replace("/login");
  };

  const displayName =
    user?.name?.trim() || (user?.email ? user.email.split("@")[0] : "Cuenta");

  // ✅ derivados de workspaces
  const personalWs = useMemo(
    () => workspaces.find((w) => w.isPersonal),
    [workspaces]
  );
  const extraWs = useMemo(
    () => workspaces.find((w) => !w.isPersonal),
    [workspaces]
  );
  const hasTwo = Boolean(personalWs && extraWs);

  const isActive = (id?: string) => Boolean(id && id === currentWorkspaceId);

  const switchWorkspace = (id: string) => {
    if (id === currentWorkspaceId) return;
    setCurrentWorkspaceId(id);
    // opcional: sentirlo como "Home"
    scrollToId("home", 600, 12);
  };

  return (
    <nav className="flex items-center gap-0">
      {/* ✅ IMPORTANT: renderiza el modal aquí */}
      <WorkspaceModal open={workspaceOpen} onOpenChange={setWorkspaceOpen} />

      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-lg tracking-tight">StaiFocus</span>
      </div>

      <div className="flex items-center justify-end gap-2 md:gap-5 md:pr-10 w-full mr-[-25px]">
        <Button
          variant="ghost"
          onClick={() => scrollToId("progress", 1000, 12)}
          className="max-[500px]:px-2"
        >
          <BarChart3 className="hidden max-[500px]:block h-5 w-5" />
          <span className="max-[500px]:hidden">Progress</span>
          <span className="sr-only">Progress</span>
        </Button>

        <Button
          variant="ghost"
          onClick={() => scrollToId("tasks-anchor", 1000, 12)}
          className="max-[500px]:px-2"
        >
          <ListChecks className="hidden max-[500px]:block h-5 w-5" />
          <span className="max-[500px]:hidden">Tasks</span>
          <span className="sr-only">Tasks</span>
        </Button>

        {/* ✅ HOME / WORKSPACE SWITCH */}
        {hasTwo && personalWs && extraWs ? (
          <div className="relative flex items-center rounded-xl border border-border bg-muted/30 p-1 w-[240px] max-[500px]:w-[200px]">
            <div
              className={cn(
                "absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-background shadow-sm",
                "transition-transform duration-800 [transition-timing-function:cubic-bezier(.2,.9,.2,1.1)]",
                isActive(extraWs.id) ? "translate-x-full" : "translate-x-0"
              )}
            />

            <button
              type="button"
              onClick={() => switchWorkspace(personalWs.id)}
              className={cn(
                "relative z-10 flex-1 px-3 py-2 text-sm font-medium rounded-lg",
                "transition-colors duration-200",
                isActive(personalWs.id)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="truncate block">{personalWs.name}</span>
            </button>

            <button
              type="button"
              onClick={() => switchWorkspace(extraWs.id)}
              className={cn(
                "relative z-10 flex-1 px-3 py-2 text-sm font-medium rounded-lg",
                "transition-colors duration-200",
                isActive(extraWs.id)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="truncate block">{extraWs.name}</span>
            </button>
          </div>
        ) : (
          <Button
            variant="ghost"
            onClick={() => scrollToId("home", 1000, 12)}
            className="max-[500px]:px-2"
          >
            <Home className="hidden max-[500px]:block h-5 w-5" />
            <span className="max-[500px]:hidden">Home</span>
            <span className="sr-only">Home</span>
          </Button>
        )}
      </div>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            disabled={isLoading}
          >
            <User className="size-5" />
            <span className="sr-only">Menú de usuario</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="truncate font-medium">
                {isLoading ? "Cargando..." : displayName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuItem
            className="py-3"
            onSelect={(e) => {
              e.preventDefault();
              setWorkspaceOpen(true);
            }}
          >
            <Settings className="mx-1 size-6" />
            <span className="pl-1">Workspace</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem className="py-3" onSelect={handleLogout}>
            <LogOut className="mx-2 size-5" />
            <span>Cerrar sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
