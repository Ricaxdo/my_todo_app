"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useWorkspaces } from "./workspace-context";

export function WorkspaceModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const {
    currentWorkspace,
    workspaces,
    currentWorkspaceId,
    setCurrentWorkspaceId,
    joinWorkspaceByCode,
    refreshWorkspaces,
  } = useWorkspaces();

  const [joinCode, setJoinCode] = useState("");
  const [joinMsg, setJoinMsg] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  if (!currentWorkspace) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Workspace</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">Cargando workspace...</p>
        </DialogContent>
      </Dialog>
    );
  }

  const onJoin = async () => {
    const clean = joinCode.trim().toUpperCase();
    if (!clean) return;

    setJoining(true);
    setJoinMsg(null);
    try {
      await joinWorkspaceByCode(clean);
      await refreshWorkspaces();
      setJoinMsg("✅ Te uniste al workspace");
      setJoinCode("");
    } catch (e: unknown) {
      setJoinMsg(e instanceof Error ? e.message : "No se pudo unir");
    } finally {
      setJoining(false);
    }
  };
  console.log("currentWorkspace:", currentWorkspace);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {currentWorkspace.name}
          </DialogTitle>
        </DialogHeader>

        {/* selector simple */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Cambiar workspace</p>
          <div className="flex flex-wrap gap-2">
            {workspaces.map((w) => (
              <Button
                key={w.id}
                variant={w.id === currentWorkspaceId ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentWorkspaceId(w.id)}
              >
                {w.name}
              </Button>
            ))}
          </div>
        </div>

        {/* ✅ invite code SOLO si NO es personal */}
        {!currentWorkspace.isPersonal && currentWorkspace.inviteCode && (
          <div className="rounded-md border p-3">
            <p className="text-sm font-medium">Código de invitación</p>

            <div className="flex items-center justify-between gap-2">
              <code className="text-sm">{currentWorkspace.inviteCode}</code>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  navigator.clipboard.writeText(currentWorkspace.inviteCode!)
                }
              >
                Copiar
              </Button>
            </div>
          </div>
        )}

        {/* tabs: members / activity / join */}
        <Tabs defaultValue="join" className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="join">Unirse</TabsTrigger>
            <TabsTrigger value="members">Miembros</TabsTrigger>
            <TabsTrigger value="activity">Actividad</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="pt-3">
            {currentWorkspace.isPersonal ? (
              <p className="text-sm text-muted-foreground">
                Este workspace es personal. No tiene miembros.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aquí conectaremos <code>GET /workspaces/:id/members</code>.
              </p>
            )}
          </TabsContent>

          <TabsContent value="activity" className="pt-3">
            <p className="text-sm text-muted-foreground">
              Aquí conectaremos <code>GET /workspaces/:id/activity</code>.
            </p>
          </TabsContent>

          <TabsContent value="join" className="pt-3">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Pega el código para unirte a un workspace.
              </p>

              <div className="flex gap-2">
                <Input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Ej: QP9C4W9T"
                  maxLength={12}
                />
                <Button onClick={onJoin} disabled={joining || !joinCode.trim()}>
                  {joining ? "Uniendo..." : "Unirme"}
                </Button>
              </div>

              {joinMsg && <p className="text-sm">{joinMsg}</p>}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
