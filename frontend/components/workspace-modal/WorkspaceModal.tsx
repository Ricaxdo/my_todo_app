"use client";

import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Activity, Building2, Sparkles, UserPlus, Users } from "lucide-react";

import { useWorkspaces } from "@/state/workspaces/workspace-context";
import { ConfirmActionDialog } from "../create-workspace-modal/ConfirmActionDialog";
import { CreateWorkspaceModal } from "../create-workspace-modal/CreateWorkspaceModal";

import InviteCodeCard from "./components/InviteCodeCard";
import JoinTab from "./components/JoinTab";
import WorkspaceLoading from "./components/WorkspaceLoading";
// (pendientes) MembersTab, ActivityTab, WorkspaceHeader, WorkspaceList

import { useWorkspaceMembers } from "./hooks/useWorkspaceMembers";
import { useWorkspaceModal } from "./hooks/useWorkspaceModal";
import type { WorkspaceModalProps } from "./types/workspaceModal.types";
import { canSeeInviteCode } from "./utils/workspaceModal.utils";

export function WorkspaceModal({ open, onOpenChange }: WorkspaceModalProps) {
  const ws = useWorkspaces();

  const vm = useWorkspaceModal({
    open,
    currentWorkspace: ws.currentWorkspace,
    currentWorkspaceId: ws.currentWorkspaceId,
    workspaces: ws.workspaces,
    setCurrentWorkspaceId: ws.setCurrentWorkspaceId,
    joinWorkspaceByCode: ws.joinWorkspaceByCode,
    refreshWorkspaces: ws.refreshWorkspaces,
    leaveWorkspace: ws.leaveWorkspace,
    deleteWorkspace: ws.deleteWorkspace,
  });

  const workspace = ws.currentWorkspace;

  const members = useWorkspaceMembers({
    workspaceId: ws.currentWorkspaceId,
    isPersonal: Boolean(workspace?.isPersonal),
    getWorkspaceMembers: ws.getWorkspaceMembers,
    removeWorkspaceMember: ws.removeWorkspaceMember,
  });
  if (!workspace)
    return <WorkspaceLoading open={open} onOpenChange={onOpenChange} />;

  const isPersonal = workspace.isPersonal;
  const showJoinTab = !isPersonal && !vm.maxReached;
  const showMembersTab = !isPersonal;

  const canInvite =
    !isPersonal &&
    Boolean(workspace.inviteCode) &&
    canSeeInviteCode(members.myRole);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[calc(100vw-24px)] sm:max-w-[600px] max-h-[85vh] overflow-y-auto gap-6">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-13 w-13 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="h-6 w-6" />
              </div>

              <div className="flex-1 min-w-0">
                <DialogTitle className="flex items-center gap-2 text-xl truncate">
                  {workspace.name}
                </DialogTitle>
                <DialogDescription>
                  Gestiona tu workspace y colabora con tu equipo
                </DialogDescription>
              </div>
            </div>

            {!isPersonal && (
              <div className="mt-3 flex flex-col sm:flex-row sm:justify-end gap-2">
                {members.myRole && members.myRole !== "owner" && (
                  <button className="hidden" />
                )}
              </div>
            )}
          </DialogHeader>

          {/* Aquí luego sacamos WorkspaceList a componente; dejo inline por ahora */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Tus Workspaces</p>
            </div>

            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2">
              {ws.workspaces.map((w) => (
                <Card
                  key={w.id}
                  className={cn(
                    "cursor-pointer border-2 p-3 transition-all hover:bg-accent/50 justify-center items-center",
                    w.id === ws.currentWorkspaceId
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  )}
                  onClick={() => vm.switchWorkspace(w)}
                >
                  <div className="flex items-center justify-center gap-3">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold",
                        w.id === ws.currentWorkspaceId
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
            </div>
          </div>

          {canInvite && (
            <InviteCodeCard
              inviteCode={workspace.inviteCode!}
              copied={vm.copied}
              onCopy={() => vm.copyInvite(workspace.inviteCode)}
            />
          )}

          {vm.switchingWs ? (
            <Card className="mt-4 p-6 space-y-3">
              <div className="h-4 w-40 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
            </Card>
          ) : (
            <Tabs
              value={vm.tab}
              onValueChange={vm.onTabChange}
              className="w-full"
            >
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

                <TabsTrigger value="activity" className="gap-2">
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">Actividad</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="join" className="space-y-4 pt-4">
                <JoinTab
                  maxReached={vm.maxReached}
                  joinCode={vm.joinCode}
                  setJoinCode={vm.setJoinCode}
                  joining={vm.joining}
                  joinMsg={vm.joinMsg}
                  onJoin={vm.join}
                />
              </TabsContent>

              {/* MembersTab + ActivityTab los conectamos en el siguiente paso */}
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <CreateWorkspaceModal
        open={vm.createOpen}
        onOpenChange={vm.setCreateOpen}
        maxReached={vm.maxReached}
        onCreate={async ({ name, iconId }) => {
          await ws.createWorkspace({ name, iconId });
          await ws.refreshWorkspaces();
          // feedback simple
        }}
        onJoin={async (code) => {
          await ws.joinWorkspaceByCode(code);
          await ws.refreshWorkspaces();
        }}
      />

      <ConfirmActionDialog
        open={vm.leaveOpen}
        onOpenChange={vm.setLeaveOpen}
        title="Abandonar"
        description="Perderás acceso a sus tareas, miembros y actividades."
        confirmText="Sí, salir"
        cancelText="Cancelar"
        loading={vm.confirmLoading}
        onConfirm={vm.confirmLeave}
      />

      <ConfirmActionDialog
        open={vm.deleteOpen}
        onOpenChange={vm.setDeleteOpen}
        title="Eliminar workspace"
        description="Se borrarán miembros y tareas. Esta acción no se puede deshacer."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="destructive"
        loading={vm.confirmLoading}
        onConfirm={() => vm.confirmDelete(() => onOpenChange(false))}
      />
    </>
  );
}

export default WorkspaceModal;
