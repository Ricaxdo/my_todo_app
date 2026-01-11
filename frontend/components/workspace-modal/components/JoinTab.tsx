"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Building2, UserPlus } from "lucide-react";

export default function JoinTab({
  maxReached,
  joinCode,
  setJoinCode,
  joining,
  joinMsg,
  onJoin,
}: {
  maxReached: boolean;
  joinCode: string;
  setJoinCode: (v: string) => void;
  joining: boolean;
  joinMsg: string | null;
  onJoin: () => void;
}) {
  if (maxReached) {
    return (
      <Card className="flex flex-col items-center justify-center gap-3 border-dashed p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Building2 className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="font-medium">Límite alcanzado</p>
          <p className="text-sm text-muted-foreground">
            Ya tienes 2 workspaces (personal + adicional). Para unirte a otro,
            primero elimina o deja el adicional.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Ingresa el código de invitación para unirte a un workspace existente
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Ej: ABC123XYZ"
            maxLength={12}
            className="font-mono uppercase"
          />

          <Button
            onClick={onJoin}
            disabled={joining || !joinCode.trim()}
            className="w-full sm:w-auto gap-2"
          >
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

      {joinMsg && (
        <Card
          className={cn(
            "p-3",
            joinMsg.startsWith("✅")
              ? "border-green-500/50 bg-green-500/10"
              : "border-destructive/50 bg-destructive/10"
          )}
        >
          <p className="text-sm">{joinMsg}</p>
        </Card>
      )}
    </div>
  );
}
