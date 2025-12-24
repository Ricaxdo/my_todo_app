import type { NextFunction, Response } from "express";
import mongoose from "mongoose";
import { unauthorized } from "../errors/AppError";
import type { AuthRequest } from "../middleware/auth";
import { WorkspaceModel } from "./workspace.model";
import { countExtraWorkspacesForUser } from "./workspace.utils";
import { WorkspaceMemberModel } from "./workspaceMember.model";

function cleanName(name: unknown): string | null {
  if (typeof name !== "string") return null;
  const n = name.trim();
  if (n.length < 2) return null;
  if (n.length > 60) return null;
  return n;
}

// ✅ retry helper (evita 409 por inviteCode duplicado)
async function createWorkspaceWithRetry(input: {
  name: string;
  owner: mongoose.Types.ObjectId;
}) {
  const MAX_TRIES = 8;

  for (let i = 0; i < MAX_TRIES; i++) {
    try {
      // tu schema genera inviteCode en pre("validate") para NO-personal
      return await WorkspaceModel.create({
        name: input.name,
        owner: input.owner,
        isPersonal: false,
      });
    } catch (err: any) {
      // duplicate key error -> inviteCode collision
      if (err?.code === 11000 && err?.keyValue?.inviteCode) {
        continue; // reintentar (nuevo inviteCode se generará)
      }
      throw err;
    }
  }

  // si reintentando no se pudo, algo raro pasa
  throw new Error("could not generate unique invite code");
}

/* =========================
   POST /workspaces
========================= */
export async function createWorkspace(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userIdRaw = req.user?._id;
    if (!userIdRaw) throw unauthorized("authorization required");

    const userId = new mongoose.Types.ObjectId(userIdRaw);

    // ✅ límite: personal + 1 extra
    const extraCount = await countExtraWorkspacesForUser(userId);
    if (extraCount >= 1) {
      return res.status(409).json({
        message: "Solo puedes tener 2 workspaces (personal + 1 adicional).",
      });
    }

    const name = cleanName((req.body as any)?.name);
    if (!name) {
      return res.status(400).json({
        message: "name must be a string between 2 and 60 characters",
      });
    }

    // ✅ aquí va el retry
    const workspace = await createWorkspaceWithRetry({ name, owner: userId });

    await WorkspaceMemberModel.create({
      workspaceId: workspace._id,
      userId,
      role: "owner",
      joinedAt: new Date(),
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
    const userIdRaw = req.user?._id;
    if (!userIdRaw) throw unauthorized("authorization required");

    const userId = new mongoose.Types.ObjectId(userIdRaw);

    if (!userId) throw unauthorized("authorization required");

    // ✅ límite: personal + 1 extra
    const extraCount = await countExtraWorkspacesForUser(userId);
    if (extraCount >= 1) {
      return res.status(409).json({
        message: "Solo puedes tener 2 workspaces (personal + 1 adicional).",
      });
    }

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

    if (workspace.isPersonal) {
      return res
        .status(400)
        .json({ message: "cannot join a personal workspace" });
    }

    await WorkspaceMemberModel.updateOne(
      { workspaceId: workspace._id, userId },
      { $setOnInsert: { joinedAt: new Date(), role: "member" } },
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
