import { Router } from "express";
import { auth } from "../middleware/auth";
import {
  createWorkspaceTodo,
  deleteWorkspaceTodo,
  getWorkspaceTodos,
  updateWorkspaceTodo,
} from "../tasks/task.controller";
import { requireWorkspaceMember } from "./workspace.middleware";

export const workspaceTodosRoutes = Router();

workspaceTodosRoutes.use(auth);

workspaceTodosRoutes.get(
  "/:workspaceId/todos",
  requireWorkspaceMember,
  getWorkspaceTodos
);

workspaceTodosRoutes.post(
  "/:workspaceId/todos",
  requireWorkspaceMember,
  createWorkspaceTodo
);

workspaceTodosRoutes.put(
  "/:workspaceId/todos/:id",
  requireWorkspaceMember,
  updateWorkspaceTodo
);

workspaceTodosRoutes.delete(
  "/:workspaceId/todos/:id",
  requireWorkspaceMember,
  deleteWorkspaceTodo
);
