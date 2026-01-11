const LS_KEY = "currentWorkspaceId";

export function getSavedWorkspaceId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LS_KEY);
}

export function saveWorkspaceId(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, id);
}

export function clearSavedWorkspaceId() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LS_KEY);
}
