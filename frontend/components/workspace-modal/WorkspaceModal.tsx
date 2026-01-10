"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useWorkspaces } from "@/state/workspaces/workspace-context";
import { Activity, UserPlus, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { ConfirmActionDialog } from "../create-workspace-modal/ConfirmActionDialog";
import { CreateWorkspaceModal } from "../create-workspace-modal/CreateWorkspaceModal";

import ActivityTab from "./components/ActivityTab";
import InviteCodeCard from "./components/InviteCodeCard";
import JoinTab from "./components/JoinTab";
import MembersTab from "./components/MembersTab";
import RemoveMemberDialog from "./components/RemoveMemberDialog";
import WorkspaceHeader from "./components/WorkspaceHeader";
import WorkspaceLoading from "./components/WorkspaceLoading";
import WorkspacePicker from "./components/WorkspacePicker";

import { useWorkspaceMembers } from "./hooks/useWorkspaceMembers";
import { useWorkspaceModal } from "./hooks/useWorkspaceModal";

import type { Member, WorkspaceModalProps } from "./types/workspaceModal.types";
import { canSeeInviteCode } from "./utils/workspaceModal.utils";

export function WorkspaceModal({ open, onOpenChange }: WorkspaceModalProps) {
  const {
    currentWorkspace,
    workspaces,
    currentWorkspaceId,
    setCurrentWorkspaceId,
    joinWorkspaceByCode,
    createWorkspace,
    refreshWorkspaces,

    getWorkspaceMembers,
    leaveWorkspace,
    deleteWorkspace,
    removeWorkspaceMember,
  } = useWorkspaces();

  // 🔹 Estado “global” del modal (tabs, join, copy, create, confirms, activity, switching)
  const modal = useWorkspaceModal({
    open,
    currentWorkspace,
    currentWorkspaceId,
    workspaces,
    setCurrentWorkspaceId,
    joinWorkspaceByCode,
    refreshWorkspaces,
    leaveWorkspace,
    deleteWorkspace,
  });

  const isPersonal = Boolean(currentWorkspace?.isPersonal);

  // 🔹 Members (carga + rol + remove handler)
  const members = useWorkspaceMembers({
    workspaceId: currentWorkspaceId,
    isPersonal,
    getWorkspaceMembers,
    removeWorkspaceMember,
  });

  // 🔹 UI state para remover miembro (dialog)
  const [removeOpen, setRemoveOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  const showJoinTab = !isPersonal && !modal.maxReached;
  const showMembersTab = !isPersonal;
  const showActivityTab = true;

  const tabsColsClass = useMemo(() => {
    const count = [showJoinTab, showMembersTab, showActivityTab].filter(
      Boolean
    ).length;

    if (count === 3) return "grid-cols-3";
    if (count === 2) return "grid-cols-2";
    return "grid-cols-1";
  }, [showJoinTab, showMembersTab, showActivityTab]);

  if (!currentWorkspace) {
    return <WorkspaceLoading open={open} onOpenChange={onOpenChange} />;
  }

  const workspace = currentWorkspace;
  const canInvite =
    !workspace.isPersonal &&
    Boolean(workspace.inviteCode) &&
    canSeeInviteCode(members.myRole);

  const handleAskRemove = (m: Member) => {
    setMemberToRemove(m);
    setRemoveOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;

    try {
      setRemoveLoading(true);
      members.setMembersError(null);
      await members.removeMember(memberToRemove.userId);
      setRemoveOpen(false);
      setMemberToRemove(null);
    } catch (e) {
      // el hook ya maneja errorMessage en refresh/remove,
      // pero por si removeMember lanza sin capturar:
      members.setMembersError(
        e instanceof Error ? e.message : "No se pudo remover"
      );
    } finally {
      setRemoveLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[calc(100vw-24px)] sm:max-w-[600px] max-h-[85vh] overflow-y-auto gap-6">
          <WorkspaceHeader
            name={workspace.name}
            isPersonal={workspace.isPersonal}
            myRole={members.myRole}
            onLeave={() => modal.setLeaveOpen(true)}
            onDelete={() => modal.setDeleteOpen(true)}
          />

          <WorkspacePicker
            workspaces={workspaces}
            currentWorkspaceId={currentWorkspaceId}
            hasExtraWorkspace={modal.hasExtraWorkspace}
            onSwitch={modal.switchWorkspace}
            onCreate={() => modal.setCreateOpen(true)}
          />

          {canInvite && (
            <InviteCodeCard
              inviteCode={workspace.inviteCode!}
              copied={modal.copied}
              onCopy={() => modal.copyInvite(workspace.inviteCode)}
            />
          )}

          {modal.switchingWs ? (
            <div className="mt-4 rounded-lg border p-6 space-y-3">
              <div className="h-4 w-40 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
            </div>
          ) : (
            <Tabs
              value={modal.tab}
              onValueChange={modal.onTabChange}
              className="w-full"
            >
              <TabsList className={cn("grid w-full", tabsColsClass)}>
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

              {showMembersTab && (
                <TabsContent value="members" className="space-y-4 pt-4">
                  <MembersTab
                    members={members.members}
                    membersLoading={members.membersLoading}
                    membersError={members.membersError}
                    myRole={members.myRole}
                    onAskRemove={handleAskRemove}
                  />
                </TabsContent>
              )}

              <TabsContent value="activity" className="space-y-4 pt-4">
                <ActivityTab activity={modal.activity} />
              </TabsContent>

              {showJoinTab && (
                <TabsContent value="join" className="space-y-4 pt-4">
                  <JoinTab
                    maxReached={modal.maxReached}
                    joinCode={modal.joinCode}
                    setJoinCode={modal.setJoinCode}
                    joining={modal.joining}
                    joinMsg={modal.joinMsg}
                    onJoin={modal.join}
                  />
                </TabsContent>
              )}
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <CreateWorkspaceModal
        open={modal.createOpen}
        onOpenChange={modal.setCreateOpen}
        maxReached={modal.maxReached}
        onCreate={async ({ name, iconId }) => {
          await createWorkspace({ name, iconId });
          await refreshWorkspaces();
          // mensaje en el mismo feedback del join
          // (si prefieres otro state, cámbialo aquí)
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          Promise.resolve().then(() => modal.joinMsg ?? null);
        }}
        onJoin={async (code) => {
          await joinWorkspaceByCode(code);
          await refreshWorkspaces();
          // idem: tu hook ya maneja join “normal”, pero aquí es el modal hijo
          // puedes setear joinMsg desde un callback si quieres (ver nota abajo)
        }}
      />

      <ConfirmActionDialog
        open={modal.leaveOpen}
        onOpenChange={modal.setLeaveOpen}
        title="Abandonar"
        description="Perderás acceso a sus tareas, miembros y actividades."
        confirmText="Sí, salir"
        cancelText="Cancelar"
        loading={modal.confirmLoading}
        onConfirm={modal.confirmLeave}
      />

      <ConfirmActionDialog
        open={modal.deleteOpen}
        onOpenChange={modal.setDeleteOpen}
        title="Eliminar workspace"
        description="Se borrarán miembros y tareas. Esta acción no se puede deshacer."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="destructive"
        loading={modal.confirmLoading}
        onConfirm={() => modal.confirmDelete(() => onOpenChange(false))}
      />

      <RemoveMemberDialog
        open={removeOpen}
        onOpenChange={(v) => {
          setRemoveOpen(v);
          if (!v) setMemberToRemove(null);
        }}
        member={memberToRemove}
        loading={removeLoading}
        onConfirm={handleConfirmRemove}
      />
    </>
  );
}
