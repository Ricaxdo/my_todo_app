import { describe, expect, it } from "vitest";
import {
  resolveActiveWorkspace,
  resolveWorkspacePair,
  shouldSwitchWorkspace,
  type Workspace,
} from "./workspaceSwitch.utils";

describe("workspaceSwitch.utils", () => {
  const personal: Workspace = { id: "p", name: "Personal", isPersonal: true };
  const extra: Workspace = { id: "t", name: "Team" };

  it("resolveWorkspacePair detecta personal y extra", () => {
    const { personalWs, extraWs, hasTwo } = resolveWorkspacePair([
      personal,
      extra,
    ]);
    expect(hasTwo).toBe(true);
    expect(personalWs?.id).toBe("p");
    expect(extraWs?.id).toBe("t");
  });

  it("resolveWorkspacePair si falta alguno -> hasTwo false", () => {
    expect(resolveWorkspacePair([personal]).hasTwo).toBe(false);
    expect(resolveWorkspacePair([extra]).hasTwo).toBe(false);
    expect(resolveWorkspacePair([]).hasTwo).toBe(false);
  });

  it("resolveActiveWorkspace elige current/other según currentWorkspaceId", () => {
    const r1 = resolveActiveWorkspace({
      personalWs: personal,
      extraWs: extra,
      currentWorkspaceId: "t",
    });
    expect(r1.isExtraActive).toBe(true);
    expect(r1.currentWs.id).toBe("t");
    expect(r1.otherWs.id).toBe("p");

    const r2 = resolveActiveWorkspace({
      personalWs: personal,
      extraWs: extra,
      currentWorkspaceId: "p",
    });
    expect(r2.isExtraActive).toBe(false);
    expect(r2.currentWs.id).toBe("p");
    expect(r2.otherWs.id).toBe("t");
  });

  it("shouldSwitchWorkspace evita calls inválidos", () => {
    expect(
      shouldSwitchWorkspace({ targetId: "", currentWorkspaceId: "p" })
    ).toBe(false);
    expect(
      shouldSwitchWorkspace({ targetId: "p", currentWorkspaceId: "p" })
    ).toBe(false);
    expect(
      shouldSwitchWorkspace({ targetId: "t", currentWorkspaceId: "p" })
    ).toBe(true);
  });
});
