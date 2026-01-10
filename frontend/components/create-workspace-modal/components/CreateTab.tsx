"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ICONS, NAME_MAX } from "../constants/workspaces.constants";
import type { IconId } from "../types/workspaces.types";
import IconPicker from "./IconPicker";

type Props = {
  /** Ya alcanzó el máximo permitido (personal + adicional). */
  maxReached: boolean;

  /** Estado controlado del nombre del workspace. */
  name: string;
  onChangeName: (v: string) => void;

  /** Estado controlado del ícono seleccionado. */
  iconId: IconId;
  onChangeIconId: (id: IconId) => void;

  /** Gate de UX: solo permite submit si pasa validaciones (name, etc.). */
  canCreate: boolean;

  /** Estados de la operación async de creación. */
  isSaving: boolean;
  createError: string | null;

  /** Acciones del modal/tab. */
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
  // Early return para el caso límite: bloquea el flujo de creación y muestra explicación.
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
      {/* Nombre (input controlado) con maxLength y contador visual */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Nombre</p>
        <Input
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder="Ej: Casa, Roomies, Equipo"
          maxLength={NAME_MAX}
        />
        <p className="text-xs text-muted-foreground">
          {/* El contador usa trim para reflejar “contenido real” (sin espacios) */}
          {name.trim().length}/{NAME_MAX}
        </p>
      </div>

      {/* Selector de ícono (controlado) usando catálogo centralizado (ICONS) */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Ícono</p>
        <IconPicker items={ICONS} value={iconId} onChange={onChangeIconId} />
      </div>

      {/* Error de creación (server/submit) en banner/card destacado */}
      {createError && (
        <Card className="p-3 border-destructive/50 bg-destructive/10">
          <p className="text-sm">{createError}</p>
        </Card>
      )}

      {/* Acciones: Cancelar siempre disponible; Crear se deshabilita si no cumple canCreate */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>

        <Button onClick={onSubmit} disabled={!canCreate} className="gap-2">
          {/* Feedback de loading: spinner + copy; evita doble submit */}
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
