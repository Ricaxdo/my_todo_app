import type { Workspace, WorkspaceDto } from "./workspaces.types";

/**
 * Convierte valores booleanos tolerando strings del backend.
 */
function toBool(v: unknown): boolean {
  return v === true || v === "true";
}

/**
 * Helper seguro para leer strings desde un objeto desconocido.
 */
function getString(obj: Record<string, unknown>, key: string): string | null {
  const value = obj[key];
  return typeof value === "string" ? value : null;
}

export function mapWorkspaceDto(w: WorkspaceDto): Workspace {
  // Tratamos el DTO como objeto genérico JSON
  const obj = w as Record<string, unknown>;

  const isPersonal = toBool(obj.isPersonal) || toBool(obj.is_personal);

  return {
    id: getString(obj, "id") ?? getString(obj, "_id") ?? "",

    name: getString(obj, "name") ?? "workspace",

    owner: getString(obj, "owner") ?? "",

    isPersonal,

    inviteCode: isPersonal ? null : getString(obj, "inviteCode"),
  };
}

export function mapWorkspaceList(data: unknown): Workspace[] {
  const obj = data as Record<string, unknown>;
  const raw = Array.isArray(obj?.workspaces)
    ? (obj.workspaces as WorkspaceDto[])
    : [];

  return raw.map(mapWorkspaceDto);
}
