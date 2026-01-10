"use client";

import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Building2 } from "lucide-react";
import type { Role } from "../types/workspaceModal.types";

export default function WorkspaceHeader({
  name,
  isPersonal,
  myRole,
  onLeave,
  onDelete,
}: {
  name: string;
  isPersonal: boolean;
  myRole?: Role;
  onLeave: () => void;
  onDelete: () => void;
}) {
  const canShowActions = !isPersonal;

  return (
    <DialogHeader>
      <div className="flex items-start gap-3">
        <div className="flex h-13 w-13 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Building2 className="h-6 w-6" />
        </div>

        <div className="flex-1 min-w-0">
          <DialogTitle className="flex items-center gap-2 text-xl truncate">
            {name}
          </DialogTitle>
          <DialogDescription>
            Gestiona tu workspace y colabora con tu equipo
          </DialogDescription>
        </div>
      </div>

      {canShowActions && (
        <div className="mt-3 flex flex-col sm:flex-row sm:justify-end gap-2">
          {myRole && myRole !== "owner" && (
            <Button
              variant="outline"
              size="lg"
              onClick={onLeave}
              className="w-full sm:w-auto"
            >
              Abandonar
            </Button>
          )}

          {myRole === "owner" && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              className="w-full sm:w-auto"
            >
              Eliminar workspace
            </Button>
          )}
        </div>
      )}
    </DialogHeader>
  );
}
