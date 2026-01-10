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
  joinCode: string;
  onChangeJoinCode: (v: string) => void;

  canJoin: boolean;
  joining: boolean;

  onSubmit: () => Promise<void>;
};

export default function JoinTab({
  joinCode,
  onChangeJoinCode,
  canJoin,
  joining,
  onSubmit,
}: Props) {
  const [msg, setMsg] = useState<string | null>(null);

  const handleJoin = async () => {
    setMsg(null);
    try {
      await onSubmit();
      setMsg("✅ Te uniste al workspace");
    } catch (e: unknown) {
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
              onChangeJoinCode(normalizeInviteCode(e.target.value))
            }
            placeholder="Ej: ABC123XYZ"
            maxLength={JOIN_MAX}
            className="font-mono uppercase"
          />

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
