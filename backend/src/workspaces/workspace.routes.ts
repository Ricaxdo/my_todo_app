import { Router } from "express";
import { auth } from "../middleware/auth";

import { getWorkspaceActivity } from "../activities/workspaceActivity.controller";

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

import { getWorkspaceMembers } from "../members/workspaceMembers.controller";
import { requireWorkspaceMember } from "../workspaces/workspace.middleware";

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

workspaceRoutes.get(
  "/:workspaceId/activity",
  requireWorkspaceMember,
  getWorkspaceActivity
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
