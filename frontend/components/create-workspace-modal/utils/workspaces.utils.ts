import {
  JOIN_MAX,
  NAME_MAX,
  NAME_MIN,
} from "../constants/workspaces.constants";

export function normalizeWorkspaceName(raw: string) {
  return raw.trim();
}

export function validateWorkspaceName(name: string): string | null {
  const clean = normalizeWorkspaceName(name);

  if (clean.length < NAME_MIN)
    return `El nombre debe tener al menos ${NAME_MIN} caracteres.`;
  if (clean.length > NAME_MAX)
    return `El nombre no puede exceder ${NAME_MAX} caracteres.`;
  return null;
}

export function normalizeInviteCode(raw: string) {
  return raw.trim().toUpperCase().slice(0, JOIN_MAX);
}

export function canJoinInviteCode(raw: string) {
  return normalizeInviteCode(raw).length >= 4;
}

/** Extractor de mensaje de error (mínimo) */
export function errorMessage(e: unknown, fallback: string) {
  return e instanceof Error ? e.message : fallback;
}
