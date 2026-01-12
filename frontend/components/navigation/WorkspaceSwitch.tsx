"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home } from "lucide-react";
import { useMemo } from "react";

type Workspace = {
  id: string;
  name: string;
  isPersonal?: boolean;
};

type WorkspaceSwitchProps = {
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
  onSwitch: (id: string) => void;

  /** Si NO hay 2 workspaces, se muestra botón Home */
  onHome: () => void;
};

export default function WorkspaceSwitch({
  workspaces,
  currentWorkspaceId,
  onSwitch,
  onHome,
}: WorkspaceSwitchProps) {
  const personalWs = useMemo(
    () => workspaces.find((w) => w.isPersonal),
    [workspaces]
  );
  const extraWs = useMemo(
    () => workspaces.find((w) => !w.isPersonal),
    [workspaces]
  );

  const hasTwo = Boolean(personalWs && extraWs);

  // Si NO hay 2 workspaces, solo mostramos Home
  if (!hasTwo || !personalWs || !extraWs) {
    return (
      <Button variant="ghost" onClick={onHome} className="px-2 sm:px-3">
        <Home className="block sm:hidden h-5 w-5" />
        <span className="hidden sm:inline">Home</span>
        <span className="sr-only">Home</span>
      </Button>
    );
  }

  // Estado “activo” sin helper function
  const isExtraActive = currentWorkspaceId === extraWs.id;
  const currentWs = isExtraActive ? extraWs : personalWs;
  const otherWs = isExtraActive ? personalWs : extraWs;

  function switchWorkspace(id: string) {
    if (!id || id === currentWorkspaceId) return;
    onSwitch(id);
  }

  function toggleWorkspace() {
    switchWorkspace(otherWs.id);
  }

  return (
    <>
      {/* MOBILE (<399px): 1 botón, click = toggle */}
      <div className="hidden max-[398px]:block w-[120px] order-3">
        <button
          type="button"
          onClick={toggleWorkspace}
          className={cn(
            "w-[120px] flex items-center justify-center text-center",
            "rounded-xl border border-border bg-muted/30 px-3 py-2",
            "text-[13px] font-semibold",
            "hover:bg-muted/50 active:scale-[0.99] transition"
          )}
        >
          <span className="truncate">{currentWs?.name ?? "Workspace"}</span>
        </button>
      </div>

      {/* DESKTOP (>=399px): switch segmentado */}
      <div className="hidden min-[399px]:block">
        <div
          className={cn(
            "relative flex items-center rounded-xl border border-border bg-muted/30 p-1",
            "w-[100px] min-[399px]:w-[240px]"
          )}
        >
          {/* Pill animado */}
          <div
            className={cn(
              "absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-background shadow-sm",
              "transition-transform duration-700 [transition-timing-function:cubic-bezier(.2,.9,.2,1.1)]",
              isExtraActive ? "translate-x-full" : "translate-x-0"
            )}
          />

          <button
            type="button"
            onClick={() => switchWorkspace(personalWs.id)}
            className={cn(
              "relative z-10 flex-1 px-3 py-2 text-sm font-medium rounded-lg",
              "transition-colors duration-200 min-w-0",
              !isExtraActive
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
              isExtraActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="truncate block">{extraWs.name}</span>
          </button>
        </div>
      </div>
    </>
  );
}
