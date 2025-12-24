import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import { WorkspaceModel } from "./workspace.model";
import { WorkspaceMemberModel } from "./workspaceMember.model";

export async function getWorkspaceMembers(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { workspaceId } = req.params as { workspaceId: string };

    // ✅ PRO: id del usuario actual (para marcar "(tú)" en FE)
    const currentUserId = String(req.user?._id ?? "");

    const ws = await WorkspaceModel.findById(workspaceId)
      .select("isPersonal owner")
      .lean()
      .exec();

    if (!ws) return res.status(404).json({ message: "workspace not found" });

    if (ws.isPersonal) {
      return res.json({ members: [] });
    }

    const members = await WorkspaceMemberModel.find({ workspaceId })
      .select("userId role joinedAt")
      .populate("userId", "name lastName")
      .lean()
      .exec();

    const normalized = members
      .map((m) => {
        const u = m.userId as any;
        if (!u) return null;

        const uid = String(u._id ?? "");

        return {
          userId: uid,
          name: String(u.name ?? ""),
          lastName: u.lastName ? String(u.lastName) : undefined,
          role: m.role,
          joinedAt: m.joinedAt,

          // ✅ PRO: útil para UI
          isYou: uid === currentUserId,
        };
      })
      .filter(Boolean) as Array<{
      userId: string;
      name: string;
      lastName?: string;
      email?: string;
      role: "owner" | "admin" | "member";
      joinedAt: Date;
      isYou: boolean; // ✅ agrega al type
    }>;

    const order = { owner: 0, admin: 1, member: 2 } as const;
    normalized.sort((a, b) => (order[a.role] ?? 9) - (order[b.role] ?? 9));

    return res.json({ members: normalized });
  } catch (err) {
    return next(err);
  }
}
