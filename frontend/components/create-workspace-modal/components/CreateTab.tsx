"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ICONS, NAME_MAX } from "../constants/workspaces.constants";
import type { IconId } from "../types/workspaces.types";
import IconPicker from "./IconPicker";

type Props = {
  maxReached: boolean;

  name: string;
  onChangeName: (v: string) => void;

  iconId: IconId;
  onChangeIconId: (id: IconId) => void;

  canCreate: boolean;
  isSaving: boolean;
  createError: string | null;

  onCancel: () => void;
  onSubmit: () => void;
};

export default function CreateTab({
  maxReached,
  name,
  onChangeName,
  iconId,
  onChangeIconId,
  canCreate,
  isSaving,
  createError,
  onCancel,
  onSubmit,
}: Props) {
  if (maxReached) {
    return (
      <Card className="p-4 border-dashed">
        <p className="text-sm font-medium">Límite alcanzado</p>
        <p className="text-sm text-muted-foreground">
          Ya tienes personal + adicional. No puedes crear otro.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Aún puedes ir a la pestaña <b>Unirse</b> si tienes un código.
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Nombre</p>
        <Input
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder="Ej: Casa, Roomies, Equipo"
          maxLength={NAME_MAX}
        />
        <p className="text-xs text-muted-foreground">
          {name.trim().length}/{NAME_MAX}
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Ícono</p>
        <IconPicker items={ICONS} value={iconId} onChange={onChangeIconId} />
      </div>

      {createError && (
        <Card className="p-3 border-destructive/50 bg-destructive/10">
          <p className="text-sm">{createError}</p>
        </Card>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>

        <Button onClick={onSubmit} disabled={!canCreate} className="gap-2">
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
  );
}
