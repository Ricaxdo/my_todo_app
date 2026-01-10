"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { JOIN_MAX } from "../constants/workspaces.constants";
import { normalizeInviteCode } from "../utils/workspaces.utils";

type Props = {
  /** Código controlado por el padre (input controlled) */
  joinCode: string;
  onChangeJoinCode: (v: string) => void;

  /** Gate de UX: valida formato/longitud para habilitar acción */
  canJoin: boolean;

  /** Estado de loading (request en vuelo) */
  joining: boolean;

  /** Acción async de unión (la lógica real vive arriba) */
  onSubmit: () => Promise<void>;
};

export default function JoinTab({
  joinCode,
  onChangeJoinCode,
  canJoin,
  joining,
  onSubmit,
}: Props) {
  /** Mensaje local para feedback inmediato (éxito/fracaso) */
  const [msg, setMsg] = useState<string | null>(null);

  const handleJoin = async () => {
    // Resetea feedback previo antes de intentar
    setMsg(null);
    try {
      await onSubmit();
      // Feedback optimista al completar
      setMsg("✅ Te uniste al workspace");
    } catch (e: unknown) {
      // Normaliza error a string sin romper tipado
      setMsg(e instanceof Error ? e.message : "No se pudo unir");
    }
  };

  return (
    <>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Ingresa el código de invitación para unirte a un workspace existente
        </p>

        <div className="flex gap-2 mb-5">
          <Input
            value={joinCode}
            onChange={(e) =>
              // Normaliza input (uppercase/trim/solo permitido) antes de guardarlo
              onChangeJoinCode(normalizeInviteCode(e.target.value))
            }
            placeholder="Ej: ABC123XYZ"
            maxLength={JOIN_MAX}
            // Visual: refuerza que es un "code" (monospace + uppercase)
            className="font-mono uppercase"
          />

          {/* CTA: se bloquea si no cumple validaciones; muestra spinner en loading */}
          <Button onClick={handleJoin} disabled={!canJoin} className="gap-2">
            {joining ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Uniendo...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Unirme
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Banner de feedback: verde para éxito, rojo para error */}
      {msg && (
        <Card
          className={cn(
            "p-4",
            msg.startsWith("✅")
              ? "border-green-500/50 bg-green-500/10"
              : "border-destructive/50 bg-destructive/10"
          )}
        >
          <p className="text-sm">{msg}</p>
        </Card>
      )}
    </>
  );
}
