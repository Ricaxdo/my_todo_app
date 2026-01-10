import { useWorkspaceActivity } from "@/hooks/useWorkspaceActivity";
import type { Workspace } from "@/state/workspaces/workspace-context";
import { useLayoutEffect, useMemo, useState } from "react";

import type { TabKey } from "../types/workspaceModal.types";
import {
  computeTab,
  errorMessage,
  normalizeInviteCode,
} from "../utils/workspaceModal.utils";
import { useWorkspaceSwitch } from "./useWorkspaceSwitch";

type Args = {
  open: boolean;
  currentWorkspace: Workspace | null;
  currentWorkspaceId: string | null;
  workspaces: Workspace[];
  setCurrentWorkspaceId: (id: string) => void;

  joinWorkspaceByCode: (code: string) => Promise<void>;
  refreshWorkspaces: () => Promise<void>;

  leaveWorkspace: (id: string) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
};

export function useWorkspaceModal(args: Args) {
  const {
    open,
    currentWorkspace,
    currentWorkspaceId,
    workspaces,
    setCurrentWorkspaceId,
    joinWorkspaceByCode,
    refreshWorkspaces,
    leaveWorkspace,
    deleteWorkspace,
  } = args;

  const [tab, setTab] = useState<TabKey>("activity");

  // Join tab
  const [joinCode, setJoinCode] = useState("");
  const [joinMsg, setJoinMsg] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  // UI states
  const [copied, setCopied] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  // Confirm dialogs
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const extraWorkspaces = useMemo(
    () => workspaces.filter((w) => !w.isPersonal),
    [workspaces]
  );

  const hasExtraWorkspace = extraWorkspaces.length > 0;
  const maxReached = workspaces.length >= 2; // personal + 1 extra

  const wsSwitch = useWorkspaceSwitch();

  const activityEnabled =
    open && tab === "activity" && Boolean(currentWorkspaceId);

  const activity = useWorkspaceActivity({
    workspaceId: currentWorkspaceId,
    enabled: activityEnabled,
  });

  // Restore tab por workspace
  useLayoutEffect(() => {
    if (!currentWorkspaceId || !currentWorkspace) return;

    const saved = wsSwitch.lastTabByWs.current[currentWorkspaceId];
    const next = computeTab({
      isPersonal: Boolean(currentWorkspace.isPersonal),
      maxReached,
      saved,
    });

    setTab((prev) => (prev === next ? prev : next));
  }, [currentWorkspaceId, currentWorkspace, maxReached, wsSwitch.lastTabByWs]);

  const onTabChange = (v: string) => {
    const next = v as TabKey;
    setTab(next);

    if (currentWorkspaceId) wsSwitch.rememberTab(currentWorkspaceId, next);
  };

  const switchWorkspace = (w: { id: string; isPersonal: boolean }) => {
    wsSwitch.switchWorkspace({
      workspace: w,
      maxReached,
      setTab,
      setWorkspaceId: setCurrentWorkspaceId,
      clearMsg: () => setJoinMsg(null),
    });
  };

  const join = async () => {
    const clean = normalizeInviteCode(joinCode);
    if (!clean) return;

    setJoining(true);
    setJoinMsg(null);

    try {
      await joinWorkspaceByCode(clean);
      await refreshWorkspaces();
      setJoinMsg("✅ Te uniste al workspace exitosamente");
      setJoinCode("");
    } catch (e) {
      setJoinMsg(errorMessage(e, "No se pudo unir"));
    } finally {
      setJoining(false);
    }
  };

  // ✅ acepta null (como tu Workspace real)
  const copyInvite = async (inviteCode: string | null | undefined) => {
    if (!inviteCode) return;

    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const confirmLeave = async () => {
    if (!currentWorkspaceId) return;

    try {
      setConfirmLoading(true);
      await leaveWorkspace(currentWorkspaceId);
      await refreshWorkspaces();
      setJoinMsg("✅ Saliste del workspace");
      setLeaveOpen(false);
    } catch (e) {
      setJoinMsg(errorMessage(e, "No se pudo salir"));
    } finally {
      setConfirmLoading(false);
    }
  };

  const confirmDelete = async (onCloseParent: () => void) => {
    if (!currentWorkspaceId) return;

    try {
      setConfirmLoading(true);
      await deleteWorkspace(currentWorkspaceId);
      await refreshWorkspaces();
      setJoinMsg("✅ Workspace eliminado");
      setDeleteOpen(false);
      onCloseParent();
    } catch (e) {
      setJoinMsg(errorMessage(e, "No se pudo eliminar"));
    } finally {
      setConfirmLoading(false);
    }
  };

  return {
    // derived
    hasExtraWorkspace,
    maxReached,

    // switching
    switchingWs: wsSwitch.switchingWs,
    switchWorkspace,

    // tabs
    tab,
    setTab,
    onTabChange,

    // join
    joinCode,
    setJoinCode,
    joinMsg,
    joining,
    join,

    // invite
    copied,
    copyInvite,

    // create modal
    createOpen,
    setCreateOpen,

    // confirms
    leaveOpen,
    setLeaveOpen,
    deleteOpen,
    setDeleteOpen,
    confirmLoading,
    confirmLeave,
    confirmDelete,

    // activity
    activity,
  };
}
