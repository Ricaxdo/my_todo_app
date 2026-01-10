import type { Member, Role, TabKey } from "../types/workspaceModal.types";

export function getMyRole(members: Member[]): Role | undefined {
  return members.find((m) => m.isYou)?.role;
}

export function canSeeInviteCode(role?: Role) {
  return role === "owner" || role === "admin";
}

export function canRemoveMember(params: { myRole?: Role; member: Member }) {
  const { myRole, member } = params;

  if (!myRole) return false;
  if (member.isYou) return false;

  if (myRole === "owner") return member.role !== "owner";
  if (myRole === "admin") return member.role === "member";

  return false;
}

export function normalizeInviteCode(raw: string) {
  return raw.trim().toUpperCase();
}

export function computeTab(params: {
  isPersonal: boolean;
  maxReached: boolean;
  saved?: TabKey;
}): TabKey {
  const { isPersonal, maxReached, saved } = params;

  const fallback: TabKey = isPersonal ? "activity" : "members";
  let next = (saved ?? fallback) as TabKey;

  if (isPersonal) next = "activity";
  if (!isPersonal && maxReached && next === "join") next = "members";

  return next;
}

export function errorMessage(e: unknown, fallback: string) {
  return e instanceof Error ? e.message : fallback;
}
