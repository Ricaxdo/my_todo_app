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
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ConfirmActionDialog } from "./ConfirmActionDialog";
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

type TabKey = "join" | "members" | "activity";

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

  const [leaveOpen, setLeaveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [removeOpen, setRemoveOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);

  const lastTabByWs = useRef<Record<string, TabKey>>({});
  const [tab, setTab] = useState<TabKey>("activity");

  const [switchingWs, setSwitchingWs] = useState(false);
  const switchTimerRef = useRef<number | null>(null);

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

  useLayoutEffect(() => {
    if (!currentWorkspaceId || !currentWorkspace) return;

    const saved = lastTabByWs.current[currentWorkspaceId];
    const fallback: TabKey = currentWorkspace.isPersonal
      ? "activity"
      : "members";

    let next = (saved ?? fallback) as TabKey;

    if (currentWorkspace.isPersonal) next = "activity";
    if (!currentWorkspace.isPersonal && maxReached && next === "join")
      next = "members";

    setTab((prev) => (prev === next ? prev : next));
  }, [currentWorkspaceId, currentWorkspace, maxReached]);

  const onTabChange = (v: string) => {
    const next = v as TabKey;
    setTab(next);

    if (currentWorkspaceId) {
      lastTabByWs.current[currentWorkspaceId] = next;
    }
  };

  const switchWorkspace = (w: { id: string; isPersonal: boolean }) => {
    // muestra loader
    setSwitchingWs(true);

    // calcula tab destino ANTES
    const saved = lastTabByWs.current[w.id];
    const fallback: TabKey = w.isPersonal ? "activity" : "members";
    let next = (saved ?? fallback) as TabKey;

    if (w.isPersonal) next = "activity";
    if (!w.isPersonal && maxReached && next === "join") next = "members";

    // aplica tab ya
    setTab(next);

    // cambia workspace ya
    setCurrentWorkspaceId(w.id);
    setJoinMsg(null);

    // oculta loader después de 300ms
    if (switchTimerRef.current) window.clearTimeout(switchTimerRef.current);
    switchTimerRef.current = window.setTimeout(() => {
      setSwitchingWs(false);
    }, 400);
  };

  useEffect(() => {
    return () => {
      if (switchTimerRef.current) window.clearTimeout(switchTimerRef.current);
    };
  }, []);

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

  const workspace = currentWorkspace;

  const isPersonal = workspace.isPersonal;
  const showJoinTab = !isPersonal && !maxReached;
  const showMembersTab = !isPersonal;
  const showActivityTab = true;

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
    if (workspace.inviteCode) {
      await navigator.clipboard.writeText(workspace.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const canShowActions = !currentWorkspace.isPersonal;

  const canSeeInviteCode = myRole === "owner" || myRole === "admin";

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
                  {workspace.name}
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
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setLeaveOpen(true)}
                    >
                      Abandonar
                    </Button>
                  )}

                  {/* si eres owner => puedes eliminar */}
                  {myRole === "owner" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteOpen(true)}
                    >
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
                  onClick={() => switchWorkspace(w)}
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

          {!workspace.isPersonal &&
            workspace.inviteCode &&
            canSeeInviteCode && (
              <Card className="border-dashed bg-muted/30 p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Código de invitación</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-md bg-background px-3 py-2 font-mono text-sm font-semibold tracking-wider">
                      {workspace.inviteCode}
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
          {switchingWs ? (
            <Card className="mt-4 p-6 space-y-3">
              <div className="h-4 w-40 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
            </Card>
          ) : (
            <>
              <Tabs value={tab} onValueChange={onTabChange} className="w-full">
                <TabsList
                  className={cn(
                    "grid w-full",
                    showJoinTab && showMembersTab
                      ? "grid-cols-3"
                      : showJoinTab || showMembersTab
                      ? "grid-cols-2"
                      : "grid-cols-1"
                  )}
                >
                  {showJoinTab && (
                    <TabsTrigger value="join" className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      <span className="hidden sm:inline">Unirse</span>
                    </TabsTrigger>
                  )}

                  {showMembersTab && (
                    <TabsTrigger value="members" className="gap-2">
                      <Users className="h-4 w-4" />
                      <span className="hidden sm:inline">Miembros</span>
                    </TabsTrigger>
                  )}

                  {showActivityTab && (
                    <TabsTrigger value="activity" className="gap-2">
                      <Activity className="h-4 w-4" />
                      <span className="hidden sm:inline">Actividad</span>
                    </TabsTrigger>
                  )}
                </TabsList>

                {/* ✅ MEMBERS reales */}
                {showMembersTab && (
                  <TabsContent value="members" className="space-y-4 pt-4">
                    <Card className="p-4">
                      {membersLoading ? (
                        <p className="text-sm text-muted-foreground">
                          Cargando miembros...
                        </p>
                      ) : membersError ? (
                        <p className="text-sm text-destructive">
                          {membersError}
                        </p>
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
                                    onClick={() => {
                                      setMemberToRemove(m);
                                      setRemoveOpen(true);
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
                  </TabsContent>
                )}

                {/* ✅ JOIN tab */}

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

                {showJoinTab && (
                  <TabsContent value="join" className="space-y-4 pt-4">
                    {maxReached ? (
                      <Card className="flex flex-col items-center justify-center gap-3 border-dashed p-8 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <Building2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">Límite alcanzado</p>
                          <p className="text-sm text-muted-foreground">
                            Ya tienes 2 workspaces (personal + adicional). Para
                            unirte a otro, primero elimina o deja el adicional.
                          </p>
                        </div>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Ingresa el código de invitación para unirte a un
                            workspace existente
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
                )}
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      <CreateWorkspaceModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        maxReached={maxReached}
        onCreate={async ({ name, iconId }) => {
          await createWorkspace({ name, iconId });
          await refreshWorkspaces();
          setJoinMsg("✅ Workspace creado");
        }}
        onJoin={async (code) => {
          await joinWorkspaceByCode(code);
          await refreshWorkspaces();
          setJoinMsg("✅ Te uniste al workspace");
        }}
      />

      <ConfirmActionDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        title="Abandonar"
        description="Perderás acceso a sus tareas, miembros y actividades."
        confirmText="Sí, salir"
        cancelText="Cancelar"
        loading={confirmLoading}
        onConfirm={async () => {
          if (!currentWorkspaceId) return;

          try {
            setConfirmLoading(true);
            await leaveWorkspace(currentWorkspaceId);
            await refreshWorkspaces();
            setJoinMsg("✅ Saliste del workspace");
            setLeaveOpen(false);
          } catch (e: unknown) {
            setJoinMsg(e instanceof Error ? e.message : "No se pudo salir");
          } finally {
            setConfirmLoading(false);
          }
        }}
      />

      <ConfirmActionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar workspace"
        description="Se borrarán miembros y tareas. Esta acción no se puede deshacer."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="destructive"
        loading={confirmLoading}
        onConfirm={async () => {
          if (!currentWorkspaceId) return;

          try {
            setConfirmLoading(true);
            await deleteWorkspace(currentWorkspaceId);
            await refreshWorkspaces();
            setJoinMsg("✅ Workspace eliminado");
            setDeleteOpen(false);
            onOpenChange(false);
          } catch (e: unknown) {
            setJoinMsg(e instanceof Error ? e.message : "No se pudo eliminar");
          } finally {
            setConfirmLoading(false);
          }
        }}
      />

      <ConfirmActionDialog
        open={removeOpen}
        onOpenChange={(v) => {
          setRemoveOpen(v);
          if (!v) setMemberToRemove(null);
        }}
        title="Remover miembro"
        description={
          memberToRemove
            ? `¿Seguro que quieres remover a ${memberToRemove.name}${
                memberToRemove.lastName ? ` ${memberToRemove.lastName}` : ""
              } del workspace?`
            : "¿Seguro que quieres remover a este miembro?"
        }
        confirmText="Sí, remover"
        cancelText="Cancelar"
        variant="destructive"
        loading={confirmLoading}
        onConfirm={async () => {
          if (!memberToRemove) return;
          if (!currentWorkspaceId) return;

          try {
            setConfirmLoading(true);
            setMembersError(null);

            await removeWorkspaceMember(
              currentWorkspaceId,
              memberToRemove.userId
            );

            // refresca lista de miembros
            const list = (await getWorkspaceMembers(
              currentWorkspaceId
            )) as Member[];
            setMembers(Array.isArray(list) ? list : []);

            setRemoveOpen(false);
            setMemberToRemove(null);
          } catch (e: unknown) {
            setMembersError(
              e instanceof Error ? e.message : "No se pudo remover"
            );
          } finally {
            setConfirmLoading(false);
          }
        }}
      />
    </>
  );
}
