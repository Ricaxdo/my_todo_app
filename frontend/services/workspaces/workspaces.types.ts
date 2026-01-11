export type WorkspaceDto = Record<string, unknown>;

export type Workspace = {
  id: string;
  name: string;
  owner: string;
  isPersonal: boolean;
  inviteCode: string | null;
};

export type WorkspaceMember = {
  userId: string;
  name: string;
  lastName?: string;
  role: "owner" | "admin" | "member";
  joinedAt: string | Date;
  isYou: boolean;
};

export type CreateWorkspaceInput = {
  name: string;
  iconId?: string;
};
