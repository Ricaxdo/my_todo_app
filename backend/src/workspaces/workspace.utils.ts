import mongoose from "mongoose";
import { WorkspaceModel } from "./workspace.model";
import { WorkspaceMemberModel } from "./workspaceMember.model";

/**
 * Cuenta cuántos workspaces NO personales tiene el usuario.
 * Regla: máximo 1 extra.
 */
export async function countExtraWorkspacesForUser(
  userId: mongoose.Types.ObjectId
) {
  const memberships = await WorkspaceMemberModel.find({ userId })
    .select("workspaceId")
    .lean()
    .exec();

  const ids = memberships.map((m) => m.workspaceId);

  if (ids.length === 0) return 0;

  const extras = await WorkspaceModel.countDocuments({
    _id: { $in: ids },
    isPersonal: false,
  }).exec();

  return extras;
}

export function generateInviteCode(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin 0/O/1/I
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

async function createWorkspaceWithRetry(input: {
  name: string;
  owner: mongoose.Types.ObjectId;
}) {
  const MAX_TRIES = 8;

  for (let i = 0; i < MAX_TRIES; i++) {
    try {
      // tu schema genera inviteCode en pre("validate")
      return await WorkspaceModel.create({
        name: input.name,
        owner: input.owner,
        isPersonal: false,
      });
    } catch (err: any) {
      // duplicate key (inviteCode)
      if (err?.code === 11000 && err?.keyValue?.inviteCode) {
        // reintenta (nuevo inviteCode se generará)
        continue;
      }
      throw err;
    }
  }

  // si ya reintentamos muchas veces, algo raro pasa
  throw new Error("could not generate unique invite code");
}
