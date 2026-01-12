"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WorkspaceModal } from "@/components/workspace-modal/WorkspaceModal";
import { Loader2, LogOut, Settings, User } from "lucide-react";
import * as React from "react";

import { UserProfileModal } from "./UserProfileModal";

type UserMenuProps = {
  isLoading: boolean;
  displayName: string;
  email?: string | null;

  phone?: string | null;

  sharedWorkspace?: {
    id: string;
    name: string;
    role?: "owner" | "admin" | "member";
  } | null;

  workspaceOpen: boolean;
  setWorkspaceOpen: (open: boolean) => void;

  onLogout: () => void | Promise<void>;

  onDeleteAccount?: () => void;
};

export default function UserMenu({
  isLoading,
  displayName,
  email,
  phone,
  sharedWorkspace,
  workspaceOpen,
  setWorkspaceOpen,
  onLogout,
  onDeleteAccount,
}: UserMenuProps) {
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [logoutOpen, setLogoutOpen] = React.useState(false);

  const safeInitial = (displayName?.trim()?.[0] ?? "U").toUpperCase();

  async function handleLogout() {
    if (logoutOpen) return;

    setLogoutOpen(true);

    try {
      // deja que el modal pinte antes de redirigir
      await new Promise((r) => setTimeout(r, 1000));
      await Promise.resolve(onLogout());
    } finally {
      // si tu app redirige, normalmente ni se verá este cierre,
      // pero lo dejamos por seguridad
      setLogoutOpen(false);
    }
  }

  return (
    <>
      {/* ✅ Logout Modal (centrado perfecto, con overlay real) */}
      <Dialog open={logoutOpen} onOpenChange={() => {}}>
        <DialogContent
          className="max-w-sm [&>button]:hidden"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          aria-busy="true"
        >
          <DialogHeader>
            <DialogTitle className="flex justify-center items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Cerrando sesión…
            </DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Modal vive aquí para que siempre esté montado */}
      <WorkspaceModal open={workspaceOpen} onOpenChange={setWorkspaceOpen} />

      <UserProfileModal
        open={profileOpen}
        onOpenChange={setProfileOpen}
        isLoading={isLoading}
        name={displayName}
        email={email}
        phone={phone}
        sharedWorkspace={sharedWorkspace}
        onDeleteAccount={onDeleteAccount}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full shrink-0"
            disabled={isLoading || logoutOpen}
          >
            <User className="size-5" />
            <span className="sr-only">Menú de usuario</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            className="gap-3 py-3 cursor-pointer focus:bg-muted/50"
            onSelect={(e) => {
              e.preventDefault();
              setProfileOpen(true);
            }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
              {safeInitial}
            </div>

            <div className="min-w-0">
              <p className="truncate font-medium leading-tight">
                {isLoading ? "Cargando..." : displayName}
              </p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Workspace */}
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

          {/* Logout */}
          <DropdownMenuItem
            className="py-3"
            disabled={logoutOpen}
            onSelect={(e) => {
              e.preventDefault();
              void handleLogout();
            }}
          >
            <LogOut className="mx-2 size-5" />
            <span>{logoutOpen ? "Saliendo..." : "Cerrar sesión"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
