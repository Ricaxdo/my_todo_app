import { Router } from "express";
import { auth } from "../middleware/auth";
import {
  createWorkspace,
  joinWorkspace,
  listMyWorkspaces,
} from "./workspace.controller";

export const workspaceRoutes = Router();

workspaceRoutes.use(auth);

workspaceRoutes.get("/", listMyWorkspaces);
workspaceRoutes.post("/", createWorkspace);
workspaceRoutes.post("/join", joinWorkspace);
