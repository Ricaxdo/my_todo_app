import { useEffect, useRef, useState } from "react";
import type { TabKey } from "../types/workspaceModal.types";
import { computeTab } from "../utils/workspaceModal.utils";

export function useWorkspaceSwitch() {
  const lastTabByWs = useRef<Record<string, TabKey>>({});
  const switchTimerRef = useRef<number | null>(null);
  const [switchingWs, setSwitchingWs] = useState(false);

  useEffect(() => {
    return () => {
      if (switchTimerRef.current) window.clearTimeout(switchTimerRef.current);
    };
  }, []);

  const rememberTab = (workspaceId: string, tab: TabKey) => {
    lastTabByWs.current[workspaceId] = tab;
  };

  const getSavedTab = (workspaceId: string) => lastTabByWs.current[workspaceId];

  const switchWorkspace = (params: {
    workspace: { id: string; isPersonal: boolean };
    maxReached: boolean;
    setTab: (t: TabKey) => void;
    setWorkspaceId: (id: string) => void;
    clearMsg: () => void;
  }) => {
    const { workspace, maxReached, setTab, setWorkspaceId, clearMsg } = params;

    setSwitchingWs(true);

    const saved = getSavedTab(workspace.id);
    const next = computeTab({
      isPersonal: workspace.isPersonal,
      maxReached,
      saved,
    });

    setTab(next);
    setWorkspaceId(workspace.id);
    clearMsg();

    if (switchTimerRef.current) window.clearTimeout(switchTimerRef.current);
    switchTimerRef.current = window.setTimeout(() => {
      setSwitchingWs(false);
    }, 400);
  };

  return {
    switchingWs,
    lastTabByWs,
    rememberTab,
    getSavedTab,
    switchWorkspace,
  };
}
