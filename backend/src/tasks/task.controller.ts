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

/**
 * Timezone del usuario (desde FE)
 * Soporta: X-Timezone (preferido) o x-tz (compat)
 */
function getRequestTimezone(req: AuthRequest): string {
  const tz = req.header("X-Timezone")?.trim() || req.header("x-tz")?.trim();

  if (tz && tz.length <= 64) return tz;
  return "America/Mexico_City";
}

/**
 * Acepta:
 * - "YYYY-MM-DD"
 * - ISO string
 * Nota: el store usará tz para rangos día/local.
 */
function parseValidDateLike(value?: string): Date | undefined {
  if (!value) return undefined;

  const isDayOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  if (isDayOnly) {
    // solo referencia; el store lo interpreta con tz
    const d = new Date(`${value}T00:00:00.000Z`);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }

  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function isValidIsoOrDay(value: string): boolean {
  return Boolean(parseValidDateLike(value));
}

// ✅ GET /todos?date=...
export async function getTasks(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?._id;
    if (!userId) throw unauthorized("authorization required");

    const personalWorkspaceId = await getPersonalWorkspaceId(userId);
    const tz = getRequestTimezone(req);

    const { date } = req.query as { date?: string };
    const selectedDate = parseValidDateLike(date);

    const tasks = await getWorkspaceTasks(
      personalWorkspaceId,
      selectedDate,
      tz
    );
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
    const tz = getRequestTimezone(req);

    const { text, priority, category, dueDate, assignees } = req.body as {
      text?: string;
      priority?: "low" | "medium" | "high";
      category?: string;
      dueDate?: string;
      assignees?: string[];
    };

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ message: "text is required" });
    }

    if (dueDate && !isValidIsoOrDay(dueDate)) {
      return res
        .status(400)
        .json({ message: "dueDate must be a valid ISO date or YYYY-MM-DD" });
    }

    const created = await createTaskInWorkspace(
      personalWorkspaceId,
      userId,
      {
        text: text.trim(),
        ...(priority !== undefined ? { priority } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(dueDate ? { dueDate } : {}),
      },
      tz // ✅ argumento extra
    );

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
    const tz = getRequestTimezone(req);

    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "task id is required" });

    const { text, completed, priority, category, dueDate } = req.body as {
      text?: string;
      completed?: boolean;
      priority?: "low" | "medium" | "high";
      category?: string;
      dueDate?: string | null; // null => unset
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
      return res
        .status(400)
        .json({ message: "dueDate must be a valid ISO date or YYYY-MM-DD" });
    }

    const updated = await updateTaskInWorkspace(
      personalWorkspaceId,
      id,
      {
        ...(text !== undefined ? { text } : {}),
        ...(completed !== undefined ? { completed } : {}),
        ...(priority !== undefined ? { priority } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(dueDate !== undefined ? { dueDate } : {}),
      },
      tz // ✅ argumento extra
    );

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
