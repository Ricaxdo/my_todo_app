import type { NextFunction, Response } from "express";
import { unauthorized } from "../errors/AppError";
import type { AuthRequest } from "../middleware/auth";
import {
  createTaskInWorkspace,
  deleteTaskInWorkspace,
  getWorkspaceTasks,
  updateTaskInWorkspace,
} from "../tasks/task.store";

function parseValidDate(date?: string): Date | undefined {
  if (!date) return undefined;
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function isValidIsoDateString(value: string) {
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}

export async function getWorkspaceTodos(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { workspaceId } = req.params as { workspaceId: string };
    const { date } = req.query as { date?: string };

    const selectedDate = parseValidDate(date);

    const tasks = await getWorkspaceTasks(workspaceId, selectedDate);
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

    const { text, priority, category, dueDate } = req.body as {
      text?: string;
      priority?: "low" | "medium" | "high";
      category?: string;
      dueDate?: string;
    };

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ message: "text is required" });
    }

    if (dueDate && !isValidIsoDateString(dueDate)) {
      return res
        .status(400)
        .json({ message: "dueDate must be a valid ISO date" });
    }

    const created = await createTaskInWorkspace(workspaceId, userId, {
      text: text.trim(),
      ...(priority !== undefined ? { priority } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(dueDate ? { dueDate } : {}),
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

    const { text, completed, priority, category, dueDate } = req.body as {
      text?: string;
      completed?: boolean;
      priority?: "low" | "medium" | "high";
      category?: string;
      dueDate?: string | null;
    };

    if (
      text === undefined &&
      completed === undefined &&
      priority === undefined &&
      category === undefined &&
      dueDate === undefined
    ) {
      return res.status(400).json({ message: "nothing to update" });
    }

    if (typeof dueDate === "string" && !isValidIsoDateString(dueDate)) {
      return res
        .status(400)
        .json({ message: "dueDate must be a valid ISO date" });
    }

    const updated = await updateTaskInWorkspace(workspaceId, id, {
      ...(text !== undefined ? { text } : {}),
      ...(completed !== undefined ? { completed } : {}),
      ...(priority !== undefined ? { priority } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(dueDate !== undefined ? { dueDate } : {}),
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
