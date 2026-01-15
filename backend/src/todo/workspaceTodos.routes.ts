import { Router } from "express";
import { auth } from "../middleware/auth";
import { requireWorkspaceMember } from "../workspaces/workspace.middleware";
import {
  createWorkspaceTodo,
  deleteWorkspaceTodo,
  getWorkspaceTodos,
  updateWorkspaceTodo,
} from "./workspaceTodos.controller";

import {
  bulkCompleteTodos,
  bulkCreateTodos,
  bulkDeleteTodos,
} from "./workspaceTodosBulk.controller";

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

workspaceTodosRoutes.post(
  "/:workspaceId/todos/bulk-create",
  requireWorkspaceMember,
  bulkCreateTodos
);

workspaceTodosRoutes.patch(
  "/:workspaceId/todos/bulk-complete",
  requireWorkspaceMember,
  bulkCompleteTodos
);

workspaceTodosRoutes.delete(
  "/:workspaceId/todos/bulk-delete",
  requireWorkspaceMember,
  bulkDeleteTodos
);
