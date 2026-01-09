// src/workspaces/workspaceTodosBulk.controller.ts
import type { NextFunction, Response } from "express";
import { createActivity } from "../activities/activity.store";
import { unauthorized } from "../errors/AppError";
import type { AuthRequest } from "../middleware/auth";
import { TaskModel } from "../tasks/task.model";
import { createTaskInWorkspace, getWorkspaceTasks } from "../tasks/task.store";

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

// POST /workspaces/:workspaceId/todos/bulk-create
export async function bulkCreateTodos(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?._id;
    if (!userId) throw unauthorized("authorization required");

    const { workspaceId } = req.params as { workspaceId: string };
    const tz = getRequestTimezone(req);

    const { items } = req.body as {
      items?: Array<{
        text: string;
        priority?: "low" | "medium" | "high";
        category?: string;
        dueDate?: string;
        assignees?: string[];
      }>;
    };

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "items is required" });
    }
    if (items.length > 100) {
      return res.status(400).json({ message: "max 100 items" });
    }

    const created: Array<
      ReturnType<typeof createTaskInWorkspace> extends Promise<infer T>
        ? T
        : never
    > = [];
    for (const it of items) {
      if (!it?.text || typeof it.text !== "string" || !it.text.trim()) continue;

      created.push(
        await createTaskInWorkspace(
          workspaceId,
          userId,
          {
            text: it.text.trim(),
            ...(it.priority ? { priority: it.priority } : {}),
            ...(it.category ? { category: it.category } : {}),
            ...(it.dueDate ? { dueDate: it.dueDate } : {}),
            ...(Array.isArray(it.assignees) && it.assignees.length
              ? { assignees: it.assignees }
              : {}),
          },
          tz
        )
      );
    }

    await createActivity({
      workspaceId,
      actorUserId: userId,
      type: "todo.bulk_create",
      entity: "todo",
      meta: { requested: items.length, created: created.length },
    });

    return res.status(201).json({ created });
  } catch (err) {
    return next(err);
  }
}

// PATCH /workspaces/:workspaceId/todos/bulk-complete
// body: { completed: true, scope?: "all"|"active"|"completed", date?: ISO|YYYY-MM-DD }
export async function bulkCompleteTodos(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?._id;
    if (!userId) throw unauthorized("authorization required");

    const { workspaceId } = req.params as { workspaceId: string };
    const tz = getRequestTimezone(req);

    const { completed, scope, date } = req.body as {
      completed?: boolean;
      scope?: "all" | "active" | "completed";
      date?: string;
    };

    if (typeof completed !== "boolean") {
      return res.status(400).json({ message: "completed boolean is required" });
    }

    const selectedDate = parseValidDateLike(date);

    // si quieres que sea “por día”, usamos tu mismo getWorkspaceTasks (timezone-safe)
    // Si no mandas date: aplica a TODO el workspace
    let filter: any = { workspaceId };

    if (selectedDate) {
      // tomamos ids de tasks del día y actualizamos por ids
      const tasks = await getWorkspaceTasks(workspaceId, selectedDate, tz);
      const ids = tasks.map((t) => t.id);
      filter = { _id: { $in: ids }, workspaceId };
    }

    if (scope === "active") filter.completed = false;
    if (scope === "completed") filter.completed = true;

    const result = await TaskModel.updateMany(filter, {
      $set: { completed },
    }).exec();
    const affected = result.modifiedCount ?? 0;

    await createActivity({
      workspaceId,
      actorUserId: userId,
      type: "todo.bulk_complete",
      entity: "todo",
      meta: {
        completed,
        scope: scope ?? "all",
        date: selectedDate ? selectedDate.toISOString() : null,
        affected,
      },
    });

    return res.json({ ok: true, affected });
  } catch (err) {
    return next(err);
  }
}

// DELETE /workspaces/:workspaceId/todos/bulk-delete
// body: { scope?: "all"|"completed"|"active", date?: ISO|YYYY-MM-DD }
export async function bulkDeleteTodos(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?._id;
    if (!userId) throw unauthorized("authorization required");

    const { workspaceId } = req.params as { workspaceId: string };
    const tz = getRequestTimezone(req);

    const { scope, date } = req.body as {
      scope?: "all" | "completed" | "active";
      date?: string;
    };

    const selectedDate = parseValidDateLike(date);

    let filter: any = { workspaceId };

    if (selectedDate) {
      const tasks = await getWorkspaceTasks(workspaceId, selectedDate, tz);
      const ids = tasks.map((t) => t.id);
      filter = { _id: { $in: ids }, workspaceId };
    }

    if (scope === "active") filter.completed = false;
    if (scope === "completed") filter.completed = true;

    const result = await TaskModel.deleteMany(filter).exec();
    const affected = result.deletedCount ?? 0;

    await createActivity({
      workspaceId,
      actorUserId: userId,
      type: "todo.bulk_delete",
      entity: "todo",
      meta: {
        scope: scope ?? "all",
        date: selectedDate ? selectedDate.toISOString() : null,
        affected,
      },
    });

    return res.json({ ok: true, affected });
  } catch (err) {
    return next(err);
  }
}
