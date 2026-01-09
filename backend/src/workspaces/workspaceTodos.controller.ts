import type { NextFunction, Response } from "express";
import { unauthorized } from "../errors/AppError";
import type { AuthRequest } from "../middleware/auth";
import {
  createTaskInWorkspace,
  deleteTaskInWorkspace,
  getWorkspaceTasks,
  updateTaskInWorkspace,
} from "../tasks/task.store";

import { createActivity } from "../activities/activity.store";
import { TaskModel } from "../tasks/task.model";

// timezone helper (igual que tu task.controller)
function getRequestTimezone(req: AuthRequest): string {
  const tz = req.header("X-Timezone")?.trim() || req.header("x-tz")?.trim();
  if (tz && tz.length <= 64) return tz;
  return "America/Mexico_City";
}

function parseValidDateLike(value?: string): Date | undefined {
  if (!value) return undefined;

  const isDayOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  if (isDayOnly) {
    const d = new Date(`${value}T00:00:00.000Z`);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }

  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function isValidIsoOrDay(value: string): boolean {
  return Boolean(parseValidDateLike(value));
}

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

    const tz = getRequestTimezone(req);
    const selectedDate = parseValidDateLike(date);

    const tasks = await getWorkspaceTasks(workspaceId, selectedDate, tz);
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
    const tz = getRequestTimezone(req);

    const { text, priority, category, dueDate, assignees } = req.body as {
      text?: string;
      priority?: "low" | "medium" | "high";
      category?: string;
      dueDate?: string; // ISO o YYYY-MM-DD
      assignees?: string[];
    };

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ message: "text is required" });
    }

    if (dueDate && !isValidIsoOrDay(dueDate)) {
      return res.status(400).json({
        message: "dueDate must be a valid ISO date or YYYY-MM-DD",
      });
    }

    const created = await createTaskInWorkspace(
      workspaceId,
      userId,
      {
        text: text.trim(),
        ...(priority !== undefined ? { priority } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(dueDate ? { dueDate } : {}),
        ...(Array.isArray(assignees) && assignees.length ? { assignees } : {}),
      },
      tz
    );

    // ✅ activity log
    await createActivity({
      workspaceId,
      actorUserId: userId,
      type: "todo.create",
      entity: "todo",
      meta: {
        todoId: created.id,
        text: created.text,
        priority: created.priority,
        dueDate: created.dueDate,
        assigneesCount: Array.isArray(created.assignees)
          ? created.assignees.length
          : 0,
      },
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
    const userId = req.user?._id;
    if (!userId) throw unauthorized("authorization required");

    const { workspaceId, id } = req.params as {
      workspaceId: string;
      id: string;
    };
    if (!id) return res.status(400).json({ message: "task id is required" });

    const tz = getRequestTimezone(req);

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

    if (typeof dueDate === "string" && !isValidIsoOrDay(dueDate)) {
      return res.status(400).json({
        message: "dueDate must be a valid ISO date or YYYY-MM-DD",
      });
    }

    // ✅ si viene completed, tomamos el valor anterior
    let prevCompleted: boolean | null = null;
    if (completed !== undefined) {
      const prev = await TaskModel.findOne({ _id: id, workspaceId })
        .select("completed")
        .lean()
        .exec();

      if (!prev) return res.status(404).json({ message: "task not found" });
      prevCompleted = Boolean(prev.completed);
    }

    const updated = await updateTaskInWorkspace(
      workspaceId,
      id,
      {
        ...(text !== undefined ? { text } : {}),
        ...(completed !== undefined ? { completed } : {}),
        ...(priority !== undefined ? { priority } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(dueDate !== undefined ? { dueDate } : {}),
      },
      tz
    );

    if (!updated) return res.status(404).json({ message: "task not found" });

    // ✅ log: toggle
    if (
      completed !== undefined &&
      prevCompleted !== null &&
      prevCompleted !== completed
    ) {
      await createActivity({
        workspaceId,
        actorUserId: userId,
        type: "todo.toggle",
        entity: "todo",
        meta: { todoId: updated.id, from: prevCompleted, to: completed },
      });
    }

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
    const userId = req.user?._id;
    if (!userId) throw unauthorized("authorization required");

    const { workspaceId, id } = req.params as {
      workspaceId: string;
      id: string;
    };
    if (!id) return res.status(400).json({ message: "task id is required" });

    // opcional: traer preview
    const prev = await TaskModel.findOne({ _id: id, workspaceId })
      .select("text")
      .lean()
      .exec();

    const ok = await deleteTaskInWorkspace(workspaceId, id);
    if (!ok) return res.status(404).json({ message: "task not found" });

    await createActivity({
      workspaceId,
      actorUserId: userId,
      type: "todo.delete",
      entity: "todo",
      meta: { todoId: id, text: prev?.text ?? undefined },
    });

    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}
