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

/**
 * Helper: resuelve el personalWorkspaceId del usuario autenticado.
 *
 * Por qué aquí:
 * - El módulo /todos trabaja exclusivamente sobre el workspace personal.
 * - Evita duplicar lógica en cada controller.
 *

*/
async function getPersonalWorkspaceId(userId: string): Promise<string> {
  const u = await UserModel.findById(userId)
    .select("personalWorkspaceId")
    .exec();

  if (!u?.personalWorkspaceId) throw unauthorized("authorization required");
  return u.personalWorkspaceId.toString();
}

/**
 * Extrae la timezone del usuario desde headers del FE.
 * Soporta:
 * - X-Timezone (preferido)
 * - x-tz (compat / legacy)
 *
 * Se limita longitud para evitar headers raros / abuso.
 */
function getRequestTimezone(req: AuthRequest): string {
  const tz = req.header("X-Timezone")?.trim() || req.header("x-tz")?.trim();

  if (tz && tz.length <= 64) return tz;
  return "America/Mexico_City";
}

/**
 * Parsea fechas que llegan como string desde el FE:
 * - "YYYY-MM-DD" (día local)
 * - ISO string
 *
 * Importante:
 * - Para "YYYY-MM-DD" creamos un Date "referencia" (00:00Z),
 *   pero el store es quien interpreta correctamente el rango del día usando `tz`.
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

/**
 * Validación rápida: retorna true si el string es parseable como:
 * - ISO
 * - YYYY-MM-DD
 */
function isValidIsoOrDay(value: string): boolean {
  return Boolean(parseValidDateLike(value));
}

// ✅ GET /todos?date=...
/**
 * Lista tasks del workspace personal.
 */
export async function getTasks(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Auth: el userId lo inyecta el middleware auth() en req.user.
    const userId = req.user?._id;
    if (!userId) throw unauthorized("authorization required");

    const personalWorkspaceId = await getPersonalWorkspaceId(userId);
    const tz = getRequestTimezone(req);

    // date es opcional; si no viene, el store decide el default (o trae todo).
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

/**
 * POST /todos
 * Crea una task dentro del workspace personal.
 *
 * Body:
 * - text (required)
 * - priority/category/dueDate/assignees (opcionales)
 *
 */
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

    // Guard básico: no creamos tasks vacías.
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ message: "text is required" });
    }

    // Validación simple de dueDate.
    if (dueDate && !isValidIsoOrDay(dueDate)) {
      return res
        .status(400)
        .json({ message: "dueDate must be a valid ISO date or YYYY-MM-DD" });
    }

    /**
     * Creamos el payload de forma “limpia”:
     * - Solo incluimos campos si vienen (evita overwrite con undefined)
     * - assignees solo si es array no vacío
     */
    const created = await createTaskInWorkspace(
      personalWorkspaceId,
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

    return res.status(201).json(created);
  } catch (err) {
    return next(err);
  }
}

/**
 * PUT /todos/:id
 * Actualiza campos parciales de una task del workspace personal.
 *
 * Body puede incluir:
 * - text, completed, priority, category, dueDate
 * - dueDate: string (set) o null (unset) o undefined (no tocar)
 */
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

    // Task id en params
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "task id is required" });

    const { text, completed, priority, category, dueDate } = req.body as {
      text?: string;
      completed?: boolean;
      priority?: "low" | "medium" | "high";
      category?: string;
      dueDate?: string | null; // null => unset
    };

    /**
     * Evita updates vacíos (reduce requests inútiles y casos raros).
     */
    if (
      text === undefined &&
      completed === undefined &&
      priority === undefined &&
      category === undefined &&
      dueDate === undefined
    ) {
      return res.status(400).json({ message: "nothing to update" });
    }

    // Validación: si dueDate es string, debe ser ISO o YYYY-MM-DD
    if (typeof dueDate === "string" && !isValidIsoOrDay(dueDate)) {
      return res
        .status(400)
        .json({ message: "dueDate must be a valid ISO date or YYYY-MM-DD" });
    }

    /**
     * Update parcial:
     * - Solo pasamos propiedades presentes
     * - dueDate puede ser null para “unset” (depende del store/modelo)
     */
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
      tz
    );

    if (!updated) return res.status(404).json({ message: "task not found" });
    return res.json(updated);
  } catch (err) {
    return next(err);
  }
}

/**
 * DELETE /todos/:id
 * Elimina una task del workspace personal.
 */
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
