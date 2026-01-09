"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WorkspaceModal } from "@/components/workspaces/WorkspaceModal";
import { useTodoDashboard } from "@/hooks/useTodoDashboard";
import { cn } from "@/lib/utils";
import { useAuth } from "@/state/auth/auth-context";
import { useWorkspaces } from "@/state/workspaces/workspace-context";

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

  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  const handleLogout = () => {
    logout();
    logoutTasks();
    router.replace("/login");
  };

  const displayName =
    user?.name?.trim() || (user?.email ? user.email.split("@")[0] : "Cuenta");

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
    scrollToId("home", 600, 12);
  };

  const currentWs = useMemo(() => {
    if (!hasTwo || !personalWs || !extraWs) return null;
    return isActive(extraWs.id) ? extraWs : personalWs;
  }, [hasTwo, personalWs, extraWs, currentWorkspaceId]);

  const otherWs = useMemo(() => {
    if (!hasTwo || !personalWs || !extraWs) return null;
    return isActive(extraWs.id) ? personalWs : extraWs;
  }, [hasTwo, personalWs, extraWs, currentWorkspaceId]);

  const toggleWorkspace = () => {
    if (!otherWs) return;
    switchWorkspace(otherWs.id);
  };

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {/* ✅ IMPORTANT: renderiza el modal aquí */}
      <WorkspaceModal open={workspaceOpen} onOpenChange={setWorkspaceOpen} />

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
      <div className="flex items-center justify-end gap-0 md:gap-0 md:pr-0 flex-1 min-w-0">
        <Button
          variant="ghost"
          onClick={() => scrollToId("progress", 1000, 12)}
          className=""
        >
          <BarChart3 className="block sm:hidden h-5 w-5" />
          <span className="hidden sm:inline">Progress</span>
          <span className="sr-only">Progress</span>
        </Button>

        <Button
          variant="ghost"
          onClick={() => scrollToId("tasks-anchor", 1000, 12)}
          className="px-2 sm:px-3"
        >
          <ListChecks className="block sm:hidden h-5 w-5" />
          <span className="hidden sm:inline">Tasks</span>
          <span className="sr-only">Tasks</span>
        </Button>

        {/* ✅ HOME / WORKSPACE SWITCH */}
        {hasTwo && personalWs && extraWs ? (
          <>
            {/* ✅ MOBILE (<450px): 1 solo workspace, click = toggle */}
            <div className="hidden max-[499px]:block w-[76px] order-3">
              <button
                type="button"
                onClick={toggleWorkspace}
                className={cn(
                  "w-[76px] flex items-center justify-center text-center",
                  "rounded-xl border border-border bg-muted/30 px-3 py-2",
                  "text-[13px] font-semibold",
                  "hover:bg-muted/50 active:scale-[0.99] transition"
                )}
              >
                <span className="truncate">
                  {currentWs?.name ?? "Workspace"}
                </span>
              </button>
            </div>

            {/* ✅ DESKTOP (>=550px): tu switch segmentado normal */}
            <div className="hidden min-[500px]:block">
              <div
                className="relative flex items-center rounded-xl border border-border bg-muted/30 p-1
  w-[100px] min-[500px]:w-[240px]"
              >
                <div
                  className={cn(
                    "absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-background shadow-sm",
                    "transition-transform duration-700 [transition-timing-function:cubic-bezier(.2,.9,.2,1.1)]",
                    isActive(extraWs.id) ? "translate-x-full" : "translate-x-0"
                  )}
                />

                <button
                  type="button"
                  onClick={() => switchWorkspace(personalWs.id)}
                  className={cn(
                    "relative z-10 flex-1 px-3 py-2 text-sm font-medium rounded-lg",
                    "transition-colors duration-200 min-w-0",
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
                    "transition-colors duration-200 min-w-0",
                    isActive(extraWs.id)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="truncate block">{extraWs.name}</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <Button
            variant="ghost"
            onClick={() => scrollToId("home", 1000, 12)}
            className="px-2 sm:px-3"
          >
            <Home className="block sm:hidden h-5 w-5" />
            <span className="hidden sm:inline">Home</span>
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
            className="rounded-full shrink-0"
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
