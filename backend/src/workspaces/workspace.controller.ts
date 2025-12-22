import type { NextFunction, Response } from "express";
import { unauthorized } from "../errors/AppError";
import type { AuthRequest } from "../middleware/auth";
import { WorkspaceModel } from "./workspace.model";
import { WorkspaceMemberModel } from "./workspaceMember.model";

/* =========================
   POST /workspaces
========================= */
export async function createWorkspace(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?._id;
    if (!userId) throw unauthorized("authorization required");

    const { name } = req.body as { name?: string };
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "name is required" });
    }

    const workspace = await WorkspaceModel.create({
      name: name.trim(),
      owner: userId,
      isPersonal: false, // ✅ explícito
    });

    await WorkspaceMemberModel.create({
      workspaceId: workspace._id,
      userId,
    });

    return res.status(201).json({
      workspace: {
        id: workspace._id.toString(),
        name: workspace.name,
        owner: workspace.owner.toString(),
        inviteCode: workspace.inviteCode,
        isPersonal: workspace.isPersonal,
      },
    });
  } catch (err) {
    return next(err);
  }
}

/* =========================
   POST /workspaces/join
========================= */
export async function joinWorkspace(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?._id;
    if (!userId) throw unauthorized("authorization required");

    const { code } = req.body as { code?: string };
    const clean = code?.trim().toUpperCase();
    if (!clean) {
      return res.status(400).json({ message: "code is required" });
    }

    const workspace = await WorkspaceModel.findOne({
      inviteCode: clean,
    }).exec();

    if (!workspace) {
      return res.status(404).json({ message: "workspace not found" });
    }

    // ✅ AQUÍ va la validación
    if (workspace.isPersonal) {
      return res
        .status(400)
        .json({ message: "cannot join a personal workspace" });
    }

    await WorkspaceMemberModel.updateOne(
      { workspaceId: workspace._id, userId },
      { $setOnInsert: { joinedAt: new Date() } },
      { upsert: true }
    ).exec();

    return res.json({
      workspace: {
        id: workspace._id.toString(),
        name: workspace.name,
        owner: workspace.owner.toString(),
        inviteCode: workspace.inviteCode,
        isPersonal: workspace.isPersonal,
      },
    });
  } catch (err) {
    return next(err);
  }
}

/* =========================
   GET /workspaces
========================= */
export async function listMyWorkspaces(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?._id;
    if (!userId) throw unauthorized("authorization required");

    const memberships = await WorkspaceMemberModel.find({ userId })
      .select("workspaceId")
      .lean()
      .exec();

    const workspaceIds = memberships.map((m) => m.workspaceId);

    const workspaces = await WorkspaceModel.find({
      _id: { $in: workspaceIds },
    })
      .sort({ isPersonal: -1, createdAt: -1 })
      .lean()
      .exec();

    return res.json({
      workspaces: workspaces.map((w) => ({
        id: w._id.toString(),
        name: w.name,
        owner: w.owner.toString(),
        isPersonal: w.isPersonal ?? false,
        inviteCode: w.isPersonal ? null : w.inviteCode, // ✅ clave
      })),
    });
  } catch (err) {
    return next(err);
  }
}
