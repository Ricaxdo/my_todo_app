import { useEffect, useMemo, useState } from "react";
import type { Member, Role } from "../types/workspaceModal.types";
import {
  canRemoveMember,
  errorMessage,
  getMyRole,
} from "../utils/workspaceModal.utils";

type Args = {
  workspaceId: string | null;
  isPersonal: boolean;
  getWorkspaceMembers: (id: string) => Promise<Member[]>;
  removeWorkspaceMember: (workspaceId: string, userId: string) => Promise<void>;
};

export function useWorkspaceMembers({
  workspaceId,
  isPersonal,
  getWorkspaceMembers,
  removeWorkspaceMember,
}: Args) {
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);

  const myRole = useMemo<Role | undefined>(() => getMyRole(members), [members]);

  useEffect(() => {
    const run = async () => {
      if (!workspaceId) return;

      if (isPersonal) {
        setMembers([]);
        setMembersError(null);
        setMembersLoading(false);
        return;
      }

      setMembersLoading(true);
      setMembersError(null);
      try {
        const list = await getWorkspaceMembers(workspaceId);
        setMembers(Array.isArray(list) ? list : []);
      } catch (e) {
        setMembersError(errorMessage(e, "No se pudo cargar miembros"));
      } finally {
        setMembersLoading(false);
      }
    };

    run();
  }, [workspaceId, isPersonal, getWorkspaceMembers]);

  const refreshMembers = async () => {
    if (!workspaceId || isPersonal) return;
    try {
      setMembersLoading(true);
      setMembersError(null);
      const list = await getWorkspaceMembers(workspaceId);
      setMembers(Array.isArray(list) ? list : []);
    } catch (e) {
      setMembersError(errorMessage(e, "No se pudo cargar miembros"));
    } finally {
      setMembersLoading(false);
    }
  };

  const canRemove = (member: Member) => canRemoveMember({ myRole, member });

  const removeMember = async (userId: string) => {
    if (!workspaceId) return;
    await removeWorkspaceMember(workspaceId, userId);
    await refreshMembers();
  };

  return {
    members,
    membersLoading,
    membersError,
    setMembersError,
    myRole,
    canRemove,
    refreshMembers,
    removeMember,
  };
}
