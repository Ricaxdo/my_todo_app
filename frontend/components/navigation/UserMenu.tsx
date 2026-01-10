"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WorkspaceModal } from "@/components/workspace-modal/WorkspaceModal";
import { LogOut, Settings, User } from "lucide-react";

type UserMenuProps = {
  isLoading: boolean;
  displayName: string;
  email?: string | null;

  workspaceOpen: boolean;
  setWorkspaceOpen: (open: boolean) => void;

  onLogout: () => void;
};

export default function UserMenu({
  isLoading,
  displayName,
  email,
  workspaceOpen,
  setWorkspaceOpen,
  onLogout,
}: UserMenuProps) {
  return (
    <>
      {/* Modal vive aquí para que siempre esté montado */}
      <WorkspaceModal open={workspaceOpen} onOpenChange={setWorkspaceOpen} />

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
              <p className="truncate text-xs text-muted-foreground">{email}</p>
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

          <DropdownMenuItem
            className="py-3"
            onSelect={(e) => {
              e.preventDefault();
              onLogout();
            }}
          >
            <LogOut className="mx-2 size-5" />
            <span>Cerrar sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
