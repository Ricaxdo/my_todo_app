"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Building2, Sparkles } from "lucide-react";

export default function WorkspacePicker({
  workspaces,
  currentWorkspaceId,
  hasExtraWorkspace,
  onSwitch,
  onCreate,
}: {
  workspaces: { id: string; name: string; isPersonal?: boolean }[];
  currentWorkspaceId: string | null;
  hasExtraWorkspace: boolean;
  onSwitch: (w: { id: string; isPersonal: boolean }) => void;
  onCreate: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-row sm:flex-row sm:items-center gap-2">
        <Sparkles className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-medium">Tus Workspaces</p>
      </div>

      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2">
        {workspaces.map((w) => (
          <Card
            key={w.id}
            className={cn(
              "cursor-pointer border-2 p-3 transition-all hover:bg-accent/50 justify-center items-center",
              w.id === currentWorkspaceId
                ? "border-primary bg-primary/5"
                : "border-border"
            )}
            onClick={() =>
              onSwitch({ id: w.id, isPersonal: Boolean(w.isPersonal) })
            }
          >
            <div className="flex items-center justify-center gap-3">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold",
                  w.id === currentWorkspaceId
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {w.name.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1 flex items-center gap-3">
                <p className="truncate text-sm font-medium">{w.name}</p>
              </div>
            </div>
          </Card>
        ))}

        {!hasExtraWorkspace && (
          <Card
            role="button"
            tabIndex={0}
            onClick={onCreate}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onCreate();
              }
            }}
            className={cn(
              "group cursor-pointer border-2 border-dashed p-3 transition-all hover:bg-accent/50",
              "flex items-center gap-3"
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:text-foreground">
              <Building2 className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">Agregar workspace</p>
              <p className="text-xs text-muted-foreground">
                Crear o unirse con código
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
