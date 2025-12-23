"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Activity,
  Building2,
  Check,
  Clock,
  Copy,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CreateWorkspaceModal } from "./CreateWorkspaceModal";
import { useWorkspaces } from "./workspace-context";

type Role = "owner" | "admin" | "member";

type Member = {
  userId: string;
  name: string;
  lastName?: string;
  role: Role;
  joinedAt?: string | Date;
  isYou: boolean;
};

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
    createWorkspace,
    refreshWorkspaces,

    // ✅ nuevas acciones
    getWorkspaceMembers,
    leaveWorkspace,
    deleteWorkspace,
    removeWorkspaceMember,
  } = useWorkspaces();

  const [joinCode, setJoinCode] = useState("");
  const [joinMsg, setJoinMsg] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [copied, setCopied] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const extraWorkspaces = workspaces.filter((w) => !w.isPersonal);
  const hasExtraWorkspace = extraWorkspaces.length > 0;
  const maxReached = workspaces.length >= 2; // personal + 1 extra

  // ✅ members state
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);

  const myRole = useMemo<Role | undefined>(() => {
    const me = members.find((m) => m.isYou);
    return me?.role;
  }, [members]);

  // ✅ cargar members cuando cambia workspace (si no es personal)
  useEffect(() => {
    const run = async () => {
      if (!currentWorkspaceId) return;

      if (currentWorkspace?.isPersonal) {
        setMembers([]);
        setMembersError(null);
        setMembersLoading(false);
        return;
      }

      setMembersLoading(true);
      setMembersError(null);
      try {
        const list = (await getWorkspaceMembers(
          currentWorkspaceId
        )) as Member[];
        setMembers(Array.isArray(list) ? list : []);
      } catch (e: unknown) {
        setMembersError(
          e instanceof Error ? e.message : "No se pudo cargar miembros"
        );
      } finally {
        setMembersLoading(false);
      }
    };

    run();
  }, [currentWorkspaceId, currentWorkspace?.isPersonal, getWorkspaceMembers]);

  if (!currentWorkspace) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Workspace</DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
              <p className="text-sm text-muted-foreground">
                Cargando workspace...
              </p>
            </div>
          </div>
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
      setJoinMsg("✅ Te uniste al workspace exitosamente");
      setJoinCode("");
    } catch (e: unknown) {
      setJoinMsg(e instanceof Error ? e.message : "No se pudo unir");
    } finally {
      setJoining(false);
    }
  };

  const handleCopy = async () => {
    if (currentWorkspace.inviteCode) {
      await navigator.clipboard.writeText(currentWorkspace.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const canShowActions = !currentWorkspace.isPersonal;

  const onLeave = async () => {
    if (!currentWorkspaceId) return;
    const ok = window.confirm("¿Seguro que quieres salir de este workspace?");
    if (!ok) return;

    try {
      await leaveWorkspace(currentWorkspaceId);
      await refreshWorkspaces();
      setJoinMsg("✅ Saliste del workspace");
    } catch (e: unknown) {
      setJoinMsg(e instanceof Error ? e.message : "No se pudo salir");
    }
  };

  const onDelete = async () => {
    if (!currentWorkspaceId) return;
    const ok = window.confirm(
      "¿Eliminar este workspace? Se borrarán miembros y tareas."
    );
    if (!ok) return;

    try {
      await deleteWorkspace(currentWorkspaceId);
      await refreshWorkspaces();
      setJoinMsg("✅ Workspace eliminado");
      onOpenChange(false);
    } catch (e: unknown) {
      setJoinMsg(e instanceof Error ? e.message : "No se pudo eliminar");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] gap-6">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-13 w-13 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="h-6 w-6" />
              </div>

              <div className="flex-1">
                <DialogTitle className="flex items-center gap-2 text-xl">
                  {currentWorkspace.name}
                </DialogTitle>
                <DialogDescription>
                  Gestiona tu workspace y colabora con tu equipo
                </DialogDescription>
              </div>

              {/* ✅ Acciones pro (solo shared) */}
              {canShowActions && (
                <div className="flex items-center gap-2 mr-5 mt-3">
                  {/* si NO eres owner => puedes salir */}
                  {myRole && myRole !== "owner" && (
                    <Button variant="outline" size="sm" onClick={onLeave}>
                      Salir del workspace
                    </Button>
                  )}

                  {/* si eres owner => puedes eliminar */}
                  {myRole === "owner" && (
                    <Button variant="destructive" size="sm" onClick={onDelete}>
                      Eliminar workspace
                    </Button>
                  )}
                </div>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Tus Workspaces</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {workspaces.map((w) => (
                <Card
                  key={w.id}
                  className={cn(
                    "cursor-pointer border-2 p-3 transition-all hover:bg-accent/50 justify-center items-center",
                    w.id === currentWorkspaceId
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  )}
                  onClick={() => {
                    setCurrentWorkspaceId(w.id);
                    setJoinMsg(null);
                  }}
                >
                  <div className="flex items-center justify-center gap-3">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold",
                        w.id === currentWorkspaceId
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {w.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1 flex items-center gap-3">
                      <p className="truncate text-sm font-medium">{w.name}</p>
                    </div>
                  </div>
                </Card>
              ))}

              {!hasExtraWorkspace && (
                <Card
                  role="button"
                  tabIndex={0}
                  onClick={() => setCreateOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setCreateOpen(true);
                    }
                  }}
                  className={cn(
                    "group cursor-pointer border-2 border-dashed p-3 transition-all hover:bg-accent/50",
                    "flex items-center gap-3"
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:text-foreground">
                    <Building2 className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      Agregar workspace
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Crear o unirse con código
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {!currentWorkspace.isPersonal && currentWorkspace.inviteCode && (
            <Card className="border-dashed bg-muted/30 p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Código de invitación</p>
                </div>

                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-md bg-background px-3 py-2 font-mono text-sm font-semibold tracking-wider">
                    {currentWorkspace.inviteCode}
                  </code>
                  <Button
                    size="sm"
                    variant={copied ? "default" : "outline"}
                    onClick={handleCopy}
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Comparte este código para invitar a otros a tu workspace
                </p>
              </div>
            </Card>
          )}

          <Tabs defaultValue="join" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="join" className="gap-2">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Unirse</span>
              </TabsTrigger>
              <TabsTrigger value="members" className="gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Miembros</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Actividad</span>
              </TabsTrigger>
            </TabsList>

            {/* ✅ MEMBERS reales */}
            <TabsContent value="members" className="space-y-4 pt-4">
              {currentWorkspace.isPersonal ? (
                <Card className="flex flex-col items-center justify-center gap-3 border-dashed p-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Workspace Personal</p>
                    <p className="text-sm text-muted-foreground">
                      Este workspace no tiene miembros adicionales
                    </p>
                  </div>
                </Card>
              ) : (
                <Card className="p-4">
                  {membersLoading ? (
                    <p className="text-sm text-muted-foreground">
                      Cargando miembros...
                    </p>
                  ) : membersError ? (
                    <p className="text-sm text-destructive">{membersError}</p>
                  ) : members.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No hay miembros.
                    </p>
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
                                {m.name} {m.lastName ?? ""}{" "}
                                {m.isYou ? "(tú)" : ""}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {m.role}
                              </p>
                            </div>

                            {canRemove && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  const ok = window.confirm(
                                    `¿Remover a ${m.name} del workspace?`
                                  );
                                  if (!ok) return;

                                  try {
                                    setMembersError(null);
                                    await removeWorkspaceMember(
                                      currentWorkspace.id,
                                      m.userId
                                    );
                                    const list = (await getWorkspaceMembers(
                                      currentWorkspace.id
                                    )) as Member[];
                                    setMembers(list);
                                  } catch (e: unknown) {
                                    setMembersError(
                                      e instanceof Error
                                        ? e.message
                                        : "No se pudo remover"
                                    );
                                  }
                                }}
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
              )}
            </TabsContent>

            <TabsContent value="activity" className="space-y-4 pt-4">
              <Card className="flex flex-col items-center justify-center gap-3 border-dashed p-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Clock className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Próximamente</p>
                  <p className="text-sm text-muted-foreground">
                    El registro de actividad estará disponible pronto
                  </p>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="join" className="space-y-4 pt-4">
              {maxReached ? (
                <Card className="flex flex-col items-center justify-center gap-3 border-dashed p-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Límite alcanzado</p>
                    <p className="text-sm text-muted-foreground">
                      Ya tienes 2 workspaces (personal + adicional). Para unirte
                      a otro, primero elimina o deja el adicional.
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Ingresa el código de invitación para unirte a un workspace
                      existente
                    </p>

                    <div className="flex gap-2">
                      <Input
                        value={joinCode}
                        onChange={(e) =>
                          setJoinCode(e.target.value.toUpperCase())
                        }
                        placeholder="Ej: ABC123XYZ"
                        maxLength={12}
                        className="font-mono uppercase"
                      />
                      <Button
                        onClick={onJoin}
                        disabled={joining || !joinCode.trim()}
                        className="gap-2"
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
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <CreateWorkspaceModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        maxReached={maxReached}
        onCreate={async ({ name, iconId }) => {
          try {
            await createWorkspace({ name, iconId });
            await refreshWorkspaces();
            setCreateOpen(false);
            setJoinMsg("✅ Workspace creado");
          } catch (e: unknown) {
            setJoinMsg(e instanceof Error ? e.message : "No se pudo crear");
          }
        }}
      />
    </>
  );
}
