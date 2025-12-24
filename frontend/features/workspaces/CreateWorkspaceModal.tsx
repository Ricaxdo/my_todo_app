"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Briefcase, Check, Home, Rocket, Sparkles, Users } from "lucide-react";
import { useMemo, useState } from "react";

type IconId = "home" | "team" | "work" | "rocket" | "sparkles";

const ICONS: { id: IconId; label: string; Icon: React.ElementType }[] = [
  { id: "home", label: "Casa", Icon: Home },
  { id: "team", label: "Equipo", Icon: Users },
  { id: "work", label: "Trabajo", Icon: Briefcase },
  { id: "rocket", label: "Proyecto", Icon: Rocket },
  { id: "sparkles", label: "Personalizado", Icon: Sparkles },
];

export function CreateWorkspaceModal({
  open,
  onOpenChange,
  maxReached,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  maxReached: boolean;
  onCreate: (payload: { name: string; iconId: IconId }) => Promise<void> | void;
}) {
  const [name, setName] = useState("");
  const [iconId, setIconId] = useState<IconId>("team");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    const n = name.trim();
    return !maxReached && n.length >= 2 && n.length <= 60 && !isSaving;
  }, [name, maxReached, isSaving]);

  const submit = async () => {
    setError(null);

    if (maxReached) {
      setError("Ya tienes 2 workspaces. No puedes crear otro.");
      return;
    }

    const clean = name.trim();
    if (clean.length < 2)
      return setError("El nombre debe tener al menos 2 caracteres.");
    if (clean.length > 60)
      return setError("El nombre no puede exceder 60 caracteres.");

    try {
      setIsSaving(true);
      await onCreate({ name: clean, iconId });
      setName("");
      setIconId("team");
      onOpenChange(false);
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "No se pudo crear el workspace"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] gap-5">
        <DialogHeader>
          <DialogTitle>Crear workspace</DialogTitle>
        </DialogHeader>

        {maxReached ? (
          <Card className="p-4 border-dashed">
            <p className="text-sm font-medium">Límite alcanzado</p>
            <p className="text-sm text-muted-foreground">
              Ya tienes personal + adicional. No puedes crear otro.
            </p>
          </Card>
        ) : (
          <>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Nombre</p>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Casa, Roomies, Equipo"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">
                {name.trim().length}/60
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Ícono</p>
              <div className="grid grid-cols-3 gap-2">
                {ICONS.map((it) => {
                  const selected = it.id === iconId;
                  return (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => setIconId(it.id)}
                      className={cn(
                        "rounded-md border p-3 text-left transition-all hover:bg-accent/50",
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-md",
                            selected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <it.Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {it.label}
                          </p>
                        </div>
                        {selected && <Check className="h-4 w-4 text-primary" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <Card className="p-3 border-destructive/50 bg-destructive/10">
                <p className="text-sm">{error}</p>
              </Card>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={submit} disabled={!canSubmit} className="gap-2">
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Creando...
                  </>
                ) : (
                  "Crear"
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
