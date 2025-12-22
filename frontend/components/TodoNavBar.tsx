"use client";

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
import { useAuth } from "@/features/auth/auth-context"; // ✅
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
  return h + extra; // extra = aire
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
  const { logout, user, isLoading } = useAuth(); // ✅ user viene de /users/me
  const { logout: logoutTasks } = useTodoDashboard(); // ✅ para limpiar tasks al logout

  const handleLogout = () => {
    logout(); // ✅ limpia token + use
    logoutTasks(); // ✅ limpia tasks
    router.replace("/login"); // ✅
  };

  const displayName =
    user?.name?.trim() || (user?.email ? user.email.split("@")[0] : "Cuenta");

  return (
    <nav className="flex items-center justify-between gap-4">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-lg tracking-tight">StaiFocus</span>
      </div>

      {/* Nav sections */}
      <div className="flex items-center justify-end gap-2 md:gap-5 md:pr-10">
        <Button
          variant="ghost"
          onClick={() => scrollToId("home", 1000, 12)}
          className="max-[500px]:px-2"
        >
          <Home className="hidden max-[500px]:block h-5 w-5" />
          <span className="max-[500px]:hidden">Home</span>
          <span className="sr-only">Home</span>
        </Button>

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
      </div>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            disabled={isLoading} // opcional
          >
            <User className="size-5" />
            <span className="sr-only">Menú de usuario</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          {/* ✅ aquí ya no dice “Mi Cuenta” */}

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

          {/* Visible only (sin lógica aún) */}
          <DropdownMenuItem className="py-3" onClick={() => {}}>
            <Settings className="mx-1 size-6" />
            <span className="pl-1">Workspace</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem className="py-3" onClick={handleLogout}>
            <LogOut className="mx-2 size-5" />
            <span>Cerrar sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
