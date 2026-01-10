import { useCallback, useMemo, useState } from "react";
import {
  DEFAULT_ICON_ID,
  DEFAULT_TAB,
  JOIN_MIN,
  NAME_MAX,
} from "../constants/workspaces.constants";
import type {
  CreateWorkspaceModalProps,
  IconId,
  TabKey,
} from "../types/workspaces.types";
import {
  canJoinInviteCode,
  errorMessage,
  normalizeInviteCode,
  normalizeWorkspaceName,
  validateWorkspaceName,
} from "../utils/workspaces.utils";

type UseCreateWorkspaceModalArgs = Pick<
  CreateWorkspaceModalProps,
  "onOpenChange" | "maxReached" | "onCreate" | "onJoin"
>;

export function useCreateWorkspaceModal({
  onOpenChange,
  maxReached,
  onCreate,
  onJoin,
}: UseCreateWorkspaceModalArgs) {
  const [tab, setTab] = useState<TabKey>(DEFAULT_TAB);

  // Create
  const [name, setName] = useState("");
  const [iconId, setIconId] = useState<IconId>(DEFAULT_ICON_ID);
  const [isSaving, setIsSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Join
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);

  const canCreate = useMemo(() => {
    const n = normalizeWorkspaceName(name);
    return !maxReached && n.length >= 2 && n.length <= NAME_MAX && !isSaving;
  }, [name, maxReached, isSaving]);

  const canJoin = useMemo(() => {
    return !joining && normalizeInviteCode(joinCode).length >= JOIN_MIN;
  }, [joining, joinCode]);

  const resetAll = useCallback(() => {
    setTab(DEFAULT_TAB);

    setName("");
    setIconId(DEFAULT_ICON_ID);
    setIsSaving(false);
    setCreateError(null);

    setJoinCode("");
    setJoining(false);
  }, []);

  const closeAndReset = useCallback(() => {
    onOpenChange(false);
    resetAll();
  }, [onOpenChange, resetAll]);

  const submitCreate = useCallback(async () => {
    setCreateError(null);

    if (maxReached) {
      setCreateError("Ya tienes 2 workspaces. No puedes crear otro.");
      return;
    }

    const validation = validateWorkspaceName(name);
    if (validation) {
      setCreateError(validation);
      return;
    }

    try {
      setIsSaving(true);
      await onCreate({ name: normalizeWorkspaceName(name), iconId });
      closeAndReset();
    } catch (e) {
      setCreateError(errorMessage(e, "No se pudo crear el workspace"));
    } finally {
      setIsSaving(false);
    }
  }, [maxReached, name, iconId, onCreate, closeAndReset]);

  /**
   * Nota: aquí no manejo "joinMsg" para evitar el bug de
   * "set msg + reset" (si quieres feedback, mejor toast).
   */
  const submitJoin = useCallback(async () => {
    const code = normalizeInviteCode(joinCode);
    if (!canJoinInviteCode(code)) return;

    try {
      setJoining(true);
      await onJoin(code);
      closeAndReset();
    } catch (e) {
      // si quieres mostrar error en UI, lo pasamos al JoinTab via prop setter
      throw new Error(errorMessage(e, "No se pudo unir"));
    } finally {
      setJoining(false);
    }
  }, [joinCode, onJoin, closeAndReset]);

  return {
    tab,
    setTab,

    name,
    setName,
    iconId,
    setIconId,
    isSaving,
    createError,
    canCreate,
    submitCreate,

    joinCode,
    setJoinCode,
    joining,
    canJoin,
    submitJoin,

    closeAndReset,
    resetAll,
  };
}
