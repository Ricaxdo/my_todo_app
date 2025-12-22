// src/tasks/task.controller.ts
import type { NextFunction, Response } from "express";
import { unauthorized } from "../errors/AppError";
import type { AuthRequest } from "../middleware/auth";
import {
  createTaskForUser,
  deleteTaskForUser,
  getMyTasks,
  updateTaskForUser,
} from "./task.store";

export async function getTasks(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?._id;
    if (!userId) throw unauthorized("authorization required");

    const tasks = await getMyTasks(userId);
    return res.json(tasks); // ✅ FE espera array
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

    const { text, priority, category } = req.body as {
      text?: string;
      priority?: "low" | "medium" | "high";
      category?: string;
      owner?: unknown; // aunque venga, se ignora
    };

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ message: "text is required" });
    }

    const input: {
      text: string;
      priority?: "low" | "medium" | "high";
      category?: string;
    } = {
      text: text.trim(),
    };

    if (priority !== undefined) input.priority = priority;
    if (category !== undefined) input.category = category;

    const created = await createTaskForUser(userId, input);

    return res.status(201).json(created); // ✅ FE espera el task directo
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

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "task id is required" });
    }

    const { text, completed, priority, category } = req.body as {
      text?: string;
      completed?: boolean;
      priority?: "low" | "medium" | "high";
      category?: string;
      owner?: unknown; // ignorar
    };

    if (
      text === undefined &&
      completed === undefined &&
      priority === undefined &&
      category === undefined
    ) {
      return res.status(400).json({ message: "nothing to update" });
    }

    const updated = await updateTaskForUser(userId, id, {
      ...(text !== undefined ? { text } : {}),
      ...(completed !== undefined ? { completed } : {}),
      ...(priority !== undefined ? { priority } : {}),
      ...(category !== undefined ? { category } : {}),
    });

    if (!updated) {
      return res.status(404).json({ message: "task not found" });
    }

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

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "task id is required" });
    }

    const ok = await deleteTaskForUser(userId, id);
    if (!ok) {
      return res.status(404).json({ message: "task not found" });
    }

    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}
