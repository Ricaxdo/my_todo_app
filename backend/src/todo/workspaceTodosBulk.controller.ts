import type { NextFunction, Response } from "express";
import { createActivity } from "../activities/activity.store";
import { unauthorized } from "../errors/AppError";
import type { AuthRequest } from "../middleware/auth";
import { TaskModel } from "../tasks/task.model";
import { createTaskInWorkspace, getWorkspaceTasks } from "../tasks/task.store";

/**
 * Helpers de timezone/fechas (misma convención que el resto de controllers).
 * Tip pro: estos helpers ya aparecen en varios archivos; conviene moverlos a /utils.
 */
function getRequestTimezone(req: AuthRequest): string {
  const tz = req.header("X-Timezone")?.trim() || req.header("x-tz")?.trim();
  if (tz && tz.length <= 64) return tz;
  return "America/Mexico_City";
}

/**
 * Parsea:
 * - "YYYY-MM-DD" (día)
 * - ISO string
 * Retorna Date si es válido, si no -> undefined.
 *
 *
 */
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
/**
 * Crea múltiples todos en un workspace (bulk).
 *
 * Reglas:
 * - items debe ser array no vacío
 * - max 100 items (anti-abuso / performance)
 * - items con text inválido se saltan (no rompe toda la operación)
 *
 * Registra activity:
 * - todo.bulk_create con { requested, created }
 */
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

    // Validación básica del payload.
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "items is required" });
    }
    if (items.length > 100) {
      return res.status(400).json({ message: "max 100 items" });
    }

    /**
     * Tipado del array "created" basado en el retorno real de createTaskInWorkspace.
     * (Evita duplicar el tipo Task si el store cambia el shape.)
     */
    const created: Array<
      ReturnType<typeof createTaskInWorkspace> extends Promise<infer T>
        ? T
        : never
    > = [];

    /**
     * Bulk por loop secuencial:
     * - Más simple y seguro para MVP.
     * - Si algún día necesitas performance, podrías paralelizar con Promise.all
     *   o hacer insertMany en store (con validaciones).
     */
    for (const it of items) {
      // Saltamos entradas inválidas sin romper el bulk completo.
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

    // Activity: resumen del bulk (no listamos todos los ids para no inflar meta).
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
/**
 * Marca como completed/uncompleted en bulk.
 *
 * Inputs:
 * - completed (required boolean)
 * - scope (opcional): all | active | completed
 * - date (opcional): si viene, el bulk se limita a las tasks de ese día (timezone-safe)
 *
 * Implementación:
 * - Si hay date: obtenemos ids vía getWorkspaceTasks y aplicamos updateMany por _id:$in
 * - Si no hay date: updateMany directo por workspaceId
 *
 * Registra activity: todo.bulk_complete con { completed, scope, date, affected }
 */
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

    // Guard: completed es obligatorio y debe ser boolean.
    if (typeof completed !== "boolean") {
      return res.status(400).json({ message: "completed boolean is required" });
    }

    const selectedDate = parseValidDateLike(date);

    /**
     * Filtro base del update:
     * - Por default afecta TODO el workspace.
     * - Si hay date: restringimos a ids del día.
     */
    let filter: any = { workspaceId };

    if (selectedDate) {
      // Tomamos ids de tasks del día usando el store (timezone-safe).
      const tasks = await getWorkspaceTasks(workspaceId, selectedDate, tz);
      const ids = tasks.map((t) => t.id);
      filter = { _id: { $in: ids }, workspaceId };
    }

    // Scope:
    // - "active" => solo las no completadas
    // - "completed" => solo las completadas
    if (scope === "active") filter.completed = false;
    if (scope === "completed") filter.completed = true;

    const result = await TaskModel.updateMany(filter, {
      $set: { completed },
    }).exec();

    // affected: cuántos docs cambiaron realmente (no matched).
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
/**
 * Borra todos en bulk.
 *
 * Inputs:
 * - scope (opcional): all | completed | active
 * - date (opcional): si viene, solo borra tasks del día (timezone-safe)
 *
 * Registra activity: todo.bulk_delete con { scope, date, affected }
 */
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

    // Filtro base: todo el workspace, o ids del día si date viene.
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
