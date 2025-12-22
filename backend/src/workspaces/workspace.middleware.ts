import type { NextFunction, Response } from "express";
import { unauthorized } from "../errors/AppError";
import type { AuthRequest } from "../middleware/auth";
import { WorkspaceMemberModel } from "./workspaceMember.model";

export async function requireWorkspaceMember(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?._id;
    if (!userId) throw unauthorized("authorization required");

    const { workspaceId } = req.params as { workspaceId?: string };
    if (!workspaceId) {
      return res.status(400).json({ message: "workspaceId is required" });
    }

    const exists = await WorkspaceMemberModel.exists({
      workspaceId,
      userId,
    });

    if (!exists) {
      return res.status(403).json({ message: "workspace access denied" });
    }

    return next();
  } catch (err) {
    return next(err);
  }
}
