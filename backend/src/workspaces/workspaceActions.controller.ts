import type { NextFunction, Response } from "express";
import mongoose from "mongoose";
import { unauthorized } from "../errors/AppError";
import type { AuthRequest } from "../middleware/auth";
import { WorkspaceModel } from "./workspace.model";
import { WorkspaceMemberModel } from "./workspaceMember.model";

// ⚠️ ajusta esto si tu store de tasks está en otro lado
import { deleteAllTasksInWorkspace } from "../tasks/task.store"; // si no existe, lo quitamos

function toObjectId(raw: unknown) {
  if (!raw) throw unauthorized("authorization required");
  return new mongoose.Types.ObjectId(String(raw));
}

/* =========================
   POST /workspaces/:workspaceId/leave
   (member/admin salen; owner NO)
========================= */
export async function leaveWorkspace(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = toObjectId(req.user?._id);

    const { workspaceId } = req.params as { workspaceId: string };
    if (!mongoose.isValidObjectId(workspaceId)) {
      return res.status(400).json({ message: "invalid workspaceId" });
    }

    const ws = await WorkspaceModel.findById(workspaceId)
      .select("isPersonal")
      .lean()
      .exec();

    if (!ws) return res.status(404).json({ message: "workspace not found" });

    if (ws.isPersonal) {
      return res
        .status(400)
        .json({ message: "cannot leave personal workspace" });
    }

    const membership = await WorkspaceMemberModel.findOne({
      workspaceId,
      userId,
    })
      .select("role")
      .lean()
      .exec();

    if (!membership) {
      return res.status(403).json({ message: "workspace access denied" });
    }

    if (membership.role === "owner") {
      return res.status(400).json({
        message:
          "owner cannot leave workspace; delete it or transfer ownership",
      });
    }

    await WorkspaceMemberModel.deleteOne({ workspaceId, userId }).exec();

    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

/* =========================
   DELETE /workspaces/:workspaceId
   (solo owner; elimina members + tasks + workspace)
========================= */
export async function deleteWorkspace(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = toObjectId(req.user?._id);

    const { workspaceId } = req.params as { workspaceId: string };
    if (!mongoose.isValidObjectId(workspaceId)) {
      return res.status(400).json({ message: "invalid workspaceId" });
    }

    const ws = await WorkspaceModel.findById(workspaceId)
      .select("isPersonal")
      .lean()
      .exec();

    if (!ws) return res.status(404).json({ message: "workspace not found" });

    if (ws.isPersonal) {
      return res
        .status(400)
        .json({ message: "cannot delete personal workspace" });
    }

    const membership = await WorkspaceMemberModel.findOne({
      workspaceId,
      userId,
    })
      .select("role")
      .lean()
      .exec();

    if (!membership) {
      return res.status(403).json({ message: "workspace access denied" });
    }

    if (membership.role !== "owner") {
      return res
        .status(403)
        .json({ message: "only owner can delete workspace" });
    }

    // 1) borrar tasks del workspace
    await deleteAllTasksInWorkspace(workspaceId);

    // 2) borrar memberships
    await WorkspaceMemberModel.deleteMany({ workspaceId }).exec();

    // 3) borrar workspace
    await WorkspaceModel.deleteOne({ _id: workspaceId }).exec();

    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

/* =========================
   DELETE /workspaces/:workspaceId/members/:memberUserId
   (owner/admin remueven)
========================= */
export async function removeWorkspaceMember(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = toObjectId(req.user?._id);

    const { workspaceId, memberUserId } = req.params as {
      workspaceId: string;
      memberUserId: string;
    };

    if (!mongoose.isValidObjectId(workspaceId)) {
      return res.status(400).json({ message: "invalid workspaceId" });
    }
    if (!mongoose.isValidObjectId(memberUserId)) {
      return res.status(400).json({ message: "invalid memberUserId" });
    }

    if (String(userId) === String(memberUserId)) {
      return res
        .status(400)
        .json({ message: "use leave endpoint to remove yourself" });
    }

    const ws = await WorkspaceModel.findById(workspaceId)
      .select("isPersonal")
      .lean()
      .exec();

    if (!ws) return res.status(404).json({ message: "workspace not found" });

    if (ws.isPersonal) {
      return res
        .status(400)
        .json({ message: "cannot manage members in personal workspace" });
    }

    const myMembership = await WorkspaceMemberModel.findOne({
      workspaceId,
      userId,
    })
      .select("role")
      .lean()
      .exec();

    if (!myMembership) {
      return res.status(403).json({ message: "workspace access denied" });
    }

    const target = await WorkspaceMemberModel.findOne({
      workspaceId,
      userId: memberUserId,
    })
      .select("role")
      .lean()
      .exec();

    if (!target) return res.status(404).json({ message: "member not found" });

    // permisos:
    // - owner puede remover admin/member (pero no owner)
    // - admin puede remover member solamente
    if (myMembership.role === "admin" && target.role !== "member") {
      return res.status(403).json({ message: "admin can only remove members" });
    }
    if (myMembership.role === "member") {
      return res.status(403).json({ message: "insufficient permissions" });
    }
    if (target.role === "owner") {
      return res.status(400).json({ message: "cannot remove owner" });
    }

    await WorkspaceMemberModel.deleteOne({
      workspaceId,
      userId: memberUserId,
    }).exec();

    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}
