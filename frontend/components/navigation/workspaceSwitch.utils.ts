export type Workspace = {
  id: string;
  name: string;
  isPersonal?: boolean;
};

export function resolveWorkspacePair(workspaces: Workspace[]) {
  const personalWs = workspaces.find((w) => w.isPersonal);
  const extraWs = workspaces.find((w) => !w.isPersonal);

  const hasTwo = Boolean(personalWs && extraWs);

  return { personalWs, extraWs, hasTwo };
}

export function resolveActiveWorkspace(params: {
  personalWs: Workspace;
  extraWs: Workspace;
  currentWorkspaceId: string | null;
}) {
  const { personalWs, extraWs, currentWorkspaceId } = params;
  const isExtraActive = currentWorkspaceId === extraWs.id;

  const currentWs = isExtraActive ? extraWs : personalWs;
  const otherWs = isExtraActive ? personalWs : extraWs;

  return { isExtraActive, currentWs, otherWs };
}

export function shouldSwitchWorkspace(params: {
  targetId: string;
  currentWorkspaceId: string | null;
}) {
  const { targetId, currentWorkspaceId } = params;
  if (!targetId) return false;
  if (targetId === currentWorkspaceId) return false;
  return true;
}
