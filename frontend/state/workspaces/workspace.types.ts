import type {
  CreateWorkspaceInput,
  Workspace,
  WorkspaceMember,
} from "@/services/workspaces/workspaces.types";

export type WorkspaceCtx = {
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
  currentWorkspace: Workspace | null;
  setCurrentWorkspaceId: (id: string) => void;

  reloadWorkspaces: () => Promise<void>;
  refreshWorkspaces: () => Promise<void>;

  joinWorkspaceByCode: (code: string) => Promise<void>;
  createWorkspace: (input: CreateWorkspaceInput) => Promise<void>;

  canCreateOrJoinExtra: boolean;

  isLoading: boolean;
  error: string | null;

  getWorkspaceMembers: (workspaceId: string) => Promise<WorkspaceMember[]>;
  leaveWorkspace: (workspaceId: string) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  removeWorkspaceMember: (
    workspaceId: string,
    memberUserId: string
  ) => Promise<void>;
};
