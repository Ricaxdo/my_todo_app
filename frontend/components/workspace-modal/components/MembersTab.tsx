"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Member, Role } from "../types/workspaceModal.types";

export default function MembersTab({
  members,
  membersLoading,
  membersError,
  myRole,
  onAskRemove,
}: {
  members: Member[];
  membersLoading: boolean;
  membersError: string | null;
  myRole?: Role;
  onAskRemove: (m: Member) => void;
}) {
  return (
    <Card className="p-4">
      {membersLoading ? (
        <p className="text-sm text-muted-foreground">Cargando miembros...</p>
      ) : membersError ? (
        <p className="text-sm text-destructive">{membersError}</p>
      ) : members.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay miembros.</p>
      ) : (
        <div className="space-y-2">
          {members.map((m) => {
            const canRemove =
              myRole === "owner"
                ? m.role !== "owner" && !m.isYou
                : myRole === "admin"
                ? m.role === "member" && !m.isYou
                : false;

            return (
              <div
                key={m.userId}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {m.name} {m.lastName ?? ""} {m.isYou ? "(tú)" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">{m.role}</p>
                </div>

                {canRemove && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAskRemove(m)}
                  >
                    Remover
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
