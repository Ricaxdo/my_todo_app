"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type SharedWorkspace = {
  id: string;
  name: string;
  role?: "owner" | "admin" | "member";
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  isLoading?: boolean;

  name: string;
  email?: string | null;
  phone?: string | null;

  sharedWorkspace?: SharedWorkspace | null;

  onDeleteAccount?: () => void;
};

function Divider() {
  return <div className="my-4 h-px w-full bg-border" />;
}

function row(label: string, value?: React.ReactNode) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 text-sm">
      <div className="text-muted-foreground">{label}</div>
      <div className="min-w-0 break-words">{value ?? "-"}</div>
    </div>
  );
}

export function UserProfileModal({
  open,
  onOpenChange,
  isLoading,
  name,
  email,
  phone,
  sharedWorkspace,
  onDeleteAccount,
}: Props) {
  const COOLDOWN_SECONDS = 8;

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(COOLDOWN_SECONDS);

  React.useEffect(() => {
    // si se cierra el confirm, reseteamos para la próxima apertura
    if (!confirmOpen) {
      setCooldown(COOLDOWN_SECONDS);
      return;
    }

    // si ya llegó a 0, ya no seguimos contando
    if (cooldown <= 0) return;

    const t = window.setTimeout(() => {
      setCooldown((s) => s - 1);
    }, 1000);

    return () => window.clearTimeout(t);
  }, [confirmOpen, cooldown]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Tu perfil</DialogTitle>
            <DialogDescription>
              Revisa tu información y opciones de cuenta.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Información */}
            <section className="space-y-3">
              <div className="text-sm font-semibold">Información</div>
              <div className="space-y-2">
                {row("Nombre", isLoading ? "Cargando..." : name)}
                {row("Email", email)}
                {row("Teléfono", phone)}
              </div>
            </section>

            <Divider />

            {/* Workspace compartido */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">
                  Workspace compartido
                </div>
                {sharedWorkspace?.role ? (
                  <Badge variant="secondary" className="capitalize">
                    {sharedWorkspace.role}
                  </Badge>
                ) : null}
              </div>

              {sharedWorkspace ? (
                <div className="space-y-2">
                  {row("Nombre", sharedWorkspace.name)}
                  {row(
                    "ID",
                    <span className="text-xs text-muted-foreground">
                      {sharedWorkspace.id}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No estás en un workspace compartido actualmente.
                </p>
              )}
            </section>

            <Divider />

            {/* Danger zone */}
            <section className="space-y-3">
              <div className="text-sm font-semibold text-destructive">
                Zona peligrosa
              </div>

              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Eliminar tu cuenta borrará tu acceso y datos asociados. Esta
                  acción no se puede deshacer.
                </p>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cerrar
                  </Button>

                  <Button
                    variant="destructive"
                    disabled={!onDeleteAccount}
                    onClick={() => {
                      // ✅ reinicia cooldown SIEMPRE al abrir confirm
                      setCooldown(COOLDOWN_SECONDS);
                      setConfirmOpen(true);
                    }}
                  >
                    Eliminar cuenta
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </DialogContent>
      </Dialog>

      {/* ✅ Confirm AlertDialog (con cooldown) */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tu cuenta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible. Se eliminará tu acceso y los datos
              asociados a tu cuenta.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>

            <AlertDialogAction
              disabled={cooldown > 0}
              onClick={() => {
                onDeleteAccount?.();
                setConfirmOpen(false);
                onOpenChange(false);
              }}
            >
              {cooldown > 0 ? `Eliminar (${cooldown}s)` : "Sí, eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
