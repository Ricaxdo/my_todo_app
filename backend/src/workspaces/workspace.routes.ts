import { Router } from "express";
import { auth } from "../middleware/auth";

import {
  createWorkspace,
  joinWorkspace,
  listMyWorkspaces,
} from "./workspace.controller";

import {
  deleteWorkspace,
  leaveWorkspace,
  removeWorkspaceMember,
} from "./workspaceActions.controller";

import { requireWorkspaceMember } from "./workspace.middleware";
import { getWorkspaceMembers } from "./workspaceMembers.controller";

export const workspaceRoutes = Router();

workspaceRoutes.use(auth);

// ==========================
// Core workspaces
// ==========================
workspaceRoutes.get("/", listMyWorkspaces);
workspaceRoutes.post("/", createWorkspace);
workspaceRoutes.post("/join", joinWorkspace);

// ==========================
// Members
// ==========================
workspaceRoutes.get(
  "/:workspaceId/members",
  requireWorkspaceMember,
  getWorkspaceMembers
);

// remover miembro (owner/admin)
workspaceRoutes.delete(
  "/:workspaceId/members/:memberUserId",
  requireWorkspaceMember,
  removeWorkspaceMember
);

// ==========================
// Leave / Delete workspace
// ==========================

// salir del workspace (member/admin)
workspaceRoutes.post(
  "/:workspaceId/leave",
  requireWorkspaceMember,
  leaveWorkspace
);

// eliminar workspace (solo owner)
workspaceRoutes.delete(
  "/:workspaceId",
  requireWorkspaceMember,
  deleteWorkspace
);
