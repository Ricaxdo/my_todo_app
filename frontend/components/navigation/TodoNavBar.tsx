"use client";

import { useRouter } from "next/navigation";
import type React from "react";
import { useMemo, useState } from "react";

import { useTodoDashboard } from "@/components/todo-dashboard/hooks/useTodoDashboard";
import { useAuth } from "@/state/auth/auth-context";
import { useWorkspaces } from "@/state/workspaces/workspace-context";

import PrioritySwitch from "@/components/add-task-form/components/PrioritySwitch";
import { prioritySliderPosition } from "@/components/add-task-form/utils/addTaskForm.utils";

import { scrollToId } from "./nav-scroll";
import UserMenu from "./UserMenu";
import WorkspaceSwitch from "./WorkspaceSwitch";

import AssigneesPicker from "@/components/add-task-form/components/AssigneesPicker";
import { useAssignees } from "@/components/add-task-form/hooks/useAssignees";

import { authApi } from "@/services/auth/auth.api";

// ✅ Tipos mínimos (evitan any)
// Ajusta Member si ya tienes un type real (mejor).
type NavMember = { id: string; name: string };

/**
 * Si ya tienes Priority en tu repo (ej: "@/types/types"),
 * cámbialo aquí y borra este union.
 */
type Priority = "low" | "medium" | "high";

type TodoNavBarProps = {
  onOpenFooter: () => void;

  // ✅ AddTask props
  isToday: boolean;
  newTask: string;
  setNewTask: (v: string) => void;

  // Si tu handler es onSubmit de form:
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;

  // (por ahora NO usamos estos en el navbar compacto, pero los recibimos)
  priority: Priority;
  setPriority: (p: Priority) => void;
  dueDate: Date;
  setDueDate: React.Dispatch<React.SetStateAction<Date>>;

  isPersonalWorkspace: boolean;
  meId: string;
  members: NavMember[];
  assignees: string[];
  setAssignees: React.Dispatch<React.SetStateAction<string[]>>;
};

/**
 * TodoNavBar
 * - Barra superior del dashboard de tareas
 * - Acciones: scroll a secciones (progress/tasks/home)
 * - Switch de workspace (si hay 2)
 * - Menú usuario (perfil + workspace modal + logout)
 */
export default function TodoNavBar(props: TodoNavBarProps) {
  const {
    onOpenFooter,
    isToday,
    newTask,
    setNewTask,
    onSubmit,
    priority,
    setPriority,
    isPersonalWorkspace,
    meId,
    members,
    assignees,
    setAssignees,
  } = props;

  const asg = useAssignees({
    isPersonalWorkspace,
    meId,
    members,
    assignees,
    setAssignees,
  });

  const router = useRouter();

  const sliderPosition = prioritySliderPosition(priority);

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

      logout();
      resetDashboardState();

      router.replace("/login");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <nav className="flex items-center gap-3 w-full">
      {/* LEFT */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg tracking-tight hidden max-[370px]:inline">
            SF
          </span>
          <span className="font-semibold text-lg tracking-tight inline max-[370px]:hidden">
            StaiFocus
          </span>
        </div>

        <button
          onClick={() => {
            onOpenFooter();
            scrollToId("footer", { duration: 900 });
          }}
          className="text-sm text-muted-foreground hover:text-foreground transition"
        >
          About it
        </button>
      </div>

      {/* CENTER: ✅ ocupa TODO lo libre */}
      {isToday && (
        <div className="hidden min-[780px]:flex flex-1 min-w-0">
          <form onSubmit={onSubmit} className="w-full">
            <div className="flex items-center gap-2 w-full rounded-xl border border-border/60 bg-background/60 backdrop-blur px-3 py-2">
              <input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Crear tarea…"
                className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder:text-muted-foreground/60"
              />

              {/* 👇 Asignaciones (solo shared) */}
              {!isPersonalWorkspace && (
                <div className="shrink-0">
                  <AssigneesPicker members={members} asg={asg} />
                </div>
              )}

              <div className="shrink-0">
                <PrioritySwitch
                  priority={priority}
                  setPriority={setPriority}
                  sliderPosition={sliderPosition}
                />
              </div>

              <button
                type="submit"
                className="text-sm px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition shrink-0"
              >
                +
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RIGHT */}
      <div className="flex items-center gap-2 shrink-0 ml-auto">
        <WorkspaceSwitch
          workspaces={workspaces}
          currentWorkspaceId={currentWorkspaceId}
          onSwitch={switchWorkspace}
          onHome={() => scrollToId("home", { duration: 1000, extraOffset: 12 })}
        />

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
      </div>
    </nav>
  );
}
