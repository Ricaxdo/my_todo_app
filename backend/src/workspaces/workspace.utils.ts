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
