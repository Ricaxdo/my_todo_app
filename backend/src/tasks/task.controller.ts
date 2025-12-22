import type { NextFunction, Response } from "express";
import { unauthorized } from "../errors/AppError";
import type { AuthRequest } from "../middleware/auth";
import { UserModel } from "../users/user.model";
import {
  createTaskInWorkspace,
  deleteTaskInWorkspace,
  getWorkspaceTasks,
  updateTaskInWorkspace,
} from "./task.store";

// helper: obtener el personalWorkspaceId
async function getPersonalWorkspaceId(userId: string): Promise<string> {
  const u = await UserModel.findById(userId)
    .select("personalWorkspaceId")
    .exec();
  if (!u?.personalWorkspaceId) throw unauthorized("authorization required");
  return u.personalWorkspaceId.toString();
}

// ✅ RUTAS NUEVAS: /workspaces/:workspaceId/todos
export async function getWorkspaceTodos(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { workspaceId } = req.params as { workspaceId: string };
    const tasks = await getWorkspaceTasks(workspaceId);
    return res.json(tasks);
  } catch (err) {
    return next(err);
  }
}

export async function createWorkspaceTodo(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?._id;
    if (!userId) throw unauthorized("authorization required");

    const { workspaceId } = req.params as { workspaceId: string };

    const { text, priority, category } = req.body as {
      text?: string;
      priority?: "low" | "medium" | "high";
      category?: string;
    };

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ message: "text is required" });
    }

    const created = await createTaskInWorkspace(workspaceId, userId, {
      text: text.trim(),
      ...(priority !== undefined ? { priority } : {}),
      ...(category !== undefined ? { category } : {}),
    });

    return res.status(201).json(created);
  } catch (err) {
    return next(err);
  }
}

export async function updateWorkspaceTodo(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { workspaceId, id } = req.params as {
      workspaceId: string;
      id: string;
    };

    if (!id) return res.status(400).json({ message: "task id is required" });

    const { text, completed, priority, category } = req.body as {
      text?: string;
      completed?: boolean;
      priority?: "low" | "medium" | "high";
      category?: string;
    };

    if (
      text === undefined &&
      completed === undefined &&
      priority === undefined &&
      category === undefined
    ) {
      return res.status(400).json({ message: "nothing to update" });
    }

    const updated = await updateTaskInWorkspace(workspaceId, id, {
      ...(text !== undefined ? { text } : {}),
      ...(completed !== undefined ? { completed } : {}),
      ...(priority !== undefined ? { priority } : {}),
      ...(category !== undefined ? { category } : {}),
    });

    if (!updated) return res.status(404).json({ message: "task not found" });
    return res.json(updated);
  } catch (err) {
    return next(err);
  }
}

export async function deleteWorkspaceTodo(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { workspaceId, id } = req.params as {
      workspaceId: string;
      id: string;
    };
    if (!id) return res.status(400).json({ message: "task id is required" });

    const ok = await deleteTaskInWorkspace(workspaceId, id);
    if (!ok) return res.status(404).json({ message: "task not found" });

    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

// ✅ COMPAT: tus rutas actuales /tasks -> usan personal workspace
export async function getTasks(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?._id;
    if (!userId) throw unauthorized("authorization required");

    const personalWorkspaceId = await getPersonalWorkspaceId(userId);
    const tasks = await getWorkspaceTasks(personalWorkspaceId);
    return res.json(tasks);
  } catch (err) {
    return next(err);
  }
}

export async function createTask(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?._id;
    if (!userId) throw unauthorized("authorization required");

    const personalWorkspaceId = await getPersonalWorkspaceId(userId);

    const { text, priority, category } = req.body as {
      text?: string;
      priority?: "low" | "medium" | "high";
      category?: string;
    };

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ message: "text is required" });
    }

    const created = await createTaskInWorkspace(personalWorkspaceId, userId, {
      text: text.trim(),
      ...(priority !== undefined ? { priority } : {}),
      ...(category !== undefined ? { category } : {}),
    });

    return res.status(201).json(created);
  } catch (err) {
    return next(err);
  }
}

export async function updateTask(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?._id;
    if (!userId) throw unauthorized("authorization required");

    const personalWorkspaceId = await getPersonalWorkspaceId(userId);

    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "task id is required" });

    const { text, completed, priority, category } = req.body as {
      text?: string;
      completed?: boolean;
      priority?: "low" | "medium" | "high";
      category?: string;
    };

    const updated = await updateTaskInWorkspace(personalWorkspaceId, id, {
      ...(text !== undefined ? { text } : {}),
      ...(completed !== undefined ? { completed } : {}),
      ...(priority !== undefined ? { priority } : {}),
      ...(category !== undefined ? { category } : {}),
    });

    if (!updated) return res.status(404).json({ message: "task not found" });
    return res.json(updated);
  } catch (err) {
    return next(err);
  }
}

export async function deleteTask(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?._id;
    if (!userId) throw unauthorized("authorization required");

    const personalWorkspaceId = await getPersonalWorkspaceId(userId);

    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "task id is required" });

    const ok = await deleteTaskInWorkspace(personalWorkspaceId, id);
    if (!ok) return res.status(404).json({ message: "task not found" });

    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}
