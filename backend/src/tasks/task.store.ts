import { DateTime } from "luxon";
import mongoose from "mongoose";
import { TaskModel, type TaskDocument } from "./task.model";
import type { Priority, Task } from "./task.types";

/**
 * Convierte un array de strings a ObjectId[] validando primero.
 * - Filtra ids inválidos (evita que Mongo truene por casting)
 * - Crea ObjectIds reales para guardar/query
 */
function toObjectIds(ids: string[]): mongoose.Types.ObjectId[] {
  return ids
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));
}

/** Timezone default del backend (puede ser override por header X-Timezone). */
const DEFAULT_TZ = "America/Mexico_City";

/**
 * Rango del día (start/end) interpretado en timezone `tz`.
 *
 * Importante:
 * - Luxon maneja bien DST y offsets.
 * - toJSDate() devuelve instantes absolutos (Date en UTC internamente),
 *   listos para usar en Mongo con $gte/$lte.
 */
function dayRangeInTz(day: Date, tz: string) {
  const dt = DateTime.fromJSDate(day, { zone: tz });
  const from = dt.startOf("day").toJSDate();
  const to = dt.endOf("day").toJSDate();
  return { from, to };
}

/**
 * Default para dueDate: fin de HOY en `tz`.
 * Útil cuando el FE no manda dueDate (tareas “para hoy”).
 */
function endOfTodayInTz(tz: string) {
  return DateTime.now().setZone(tz).endOf("day").toJSDate();
}

/**
 * Normaliza la entrada de dueDate que llega desde el FE.
 *
 * Reglas:
 * - Si viene "YYYY-MM-DD" => lo interpretamos como fin de ese día en `tz`
 *   (así aparece en el día correcto en el dashboard).
 * - Si viene ISO completo (con o sin timezone):
 *   - con timezone: se respeta tal cual
 *   - sin timezone: Luxon lo interpreta en `tz`
 */
function parseDueDateInput(input: string, tz: string): Date {
  // "2025-12-24" (date-only)
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return DateTime.fromISO(input, { zone: tz }).endOf("day").toJSDate();
  }

  // ISO completo con zona o sin zona (sin zona se interpreta en tz)
  const dt = DateTime.fromISO(input, { zone: tz });
  if (!dt.isValid) throw new Error("Invalid dueDate");
  return dt.toJSDate();
}

/**
 * Mapper: TaskDocument (Mongo/Mongoose) -> Task (DTO para FE).
 * Normaliza:
 * - id como string
 * - createdAt/updatedAt/dueDate como ISO string
 * - assignees como string[]
 */
function mapDocToTask(doc: TaskDocument & { _id: unknown }): Task {
  // createdAt debe existir; este fallback es defensivo.
  const createdAtIso =
    doc.createdAt instanceof Date
      ? doc.createdAt.toISOString()
      : doc.createdAt
      ? new Date(doc.createdAt).toISOString()
      : new Date().toISOString();

  const result: Task = {
    id: String(doc._id),
    text: doc.text,
    completed: doc.completed,
    priority: doc.priority,
    category: doc.category,
    createdAt: createdAtIso,

    /**
     * Asignees siempre presente (para evitar null-checks en FE).
     */
    assignees: Array.isArray(doc.assignees)
      ? doc.assignees.map((id) => String(id))
      : [],
  };

  /**
   * dueDate:
   * - string ISO o null (si es legacy / no tiene dueDate)
   */
  result.dueDate = doc.dueDate
    ? doc.dueDate instanceof Date
      ? doc.dueDate.toISOString()
      : new Date(doc.dueDate).toISOString()
    : null;

  return result;
}

/**
 * Lista tasks de un workspace para un día específico (timezone-safe).
 *
 * Regla de producto:
 * - Una task "vive" en el día donde cae su dueDate (en tz).
 * - Para ver tasks de un día: dueDate dentro del rango del día.
 * - Legacy: tasks sin dueDate => solo aparecen el día que fueron creadas.
 */
export async function getWorkspaceTasks(
  workspaceId: string,
  selectedDate?: Date,
  tz: string = DEFAULT_TZ
): Promise<Task[]> {
  const day = selectedDate ?? new Date();
  const { from, to } = dayRangeInTz(day, tz);

  const docs = await TaskModel.find({
    workspaceId,
    $or: [
      // ✅ modernas: filtramos por el día donde cae su dueDate
      { dueDate: { $gte: from, $lte: to } },

      // ✅ legacy: sin dueDate => día de creación
      { dueDate: { $exists: false }, createdAt: { $gte: from, $lte: to } },
      { dueDate: null, createdAt: { $gte: from, $lte: to } },
    ],
  })
    .sort({ createdAt: -1 }) // orden por creación (no por dueDate)
    .exec();

  return docs.map(mapDocToTask);
}

/**
 * Crea una task dentro de un workspace.
 *
 * - dueDate:
 *   - si viene: se normaliza con parseDueDateInput
 *   - si no viene: default fin de HOY en tz
 *
 * - assignees:
 *   - si no vienen: default [userId] (creador)
 *   - si vienen: se valida que sean ObjectIds válidos
 */
export async function createTaskInWorkspace(
  workspaceId: string,
  userId: string,
  input: {
    text: string;
    priority?: Priority;
    category?: string;
    dueDate?: string;
    assignees?: string[];
  },
  tz: string = DEFAULT_TZ
): Promise<Task> {
  const due = input.dueDate
    ? parseDueDateInput(input.dueDate, tz)
    : endOfTodayInTz(tz);

  // ✅ default: si no mandan assignees, se asigna al creador
  const assigneeIds =
    Array.isArray(input.assignees) && input.assignees.length
      ? input.assignees
      : [userId];

  const assignees = toObjectIds(assigneeIds);

  const doc = await TaskModel.create({
    text: input.text,
    priority: input.priority ?? "medium",
    category: input.category ?? "General",
    workspaceId: new mongoose.Types.ObjectId(workspaceId),
    createdBy: new mongoose.Types.ObjectId(userId),
    dueDate: due,
    assignees,
  });

  return mapDocToTask(doc);
}

/**
 * Actualiza una task (parcial) dentro del workspace.
 *
 * - Usa $set/$unset según lo que venga:
 *   - dueDate === null => unset (vuelve legacy: "sin dueDate")
 *   - dueDate string => parse y set
 *
 * - runValidators: true asegura que el schema valide en updates.
 */
export async function updateTaskInWorkspace(
  workspaceId: string,
  taskId: string,
  data: Partial<Pick<Task, "text" | "completed" | "priority" | "category">> & {
    dueDate?: string | null; // ISO, YYYY-MM-DD o null
  },
  tz: string = DEFAULT_TZ
): Promise<Task | null> {
  const setData: Record<string, unknown> = {};
  const unsetData: Record<string, unknown> = {};

  if (data.text !== undefined) setData.text = data.text;
  if (data.completed !== undefined) setData.completed = data.completed;
  if (data.priority !== undefined) setData.priority = data.priority;
  if (data.category !== undefined) setData.category = data.category;

  if (data.dueDate !== undefined) {
    if (data.dueDate === null) {
      // decisión: si mandas null, lo dejamos legacy (sin dueDate)
      unsetData.dueDate = 1;
    } else {
      setData.dueDate = parseDueDateInput(data.dueDate, tz);
    }
  }

  /**
   * Construimos el update minimizando operadores:
   * - solo $set si no hay $unset
   * - si hay ambos, incluimos los que correspondan
   */
  const update =
    Object.keys(unsetData).length === 0
      ? { $set: setData }
      : {
          ...(Object.keys(setData).length ? { $set: setData } : {}),
          $unset: unsetData,
        };

  /**
   * findOneAndUpdate con scope:
   * - workspaceId para evitar tocar tasks de otros workspaces
   * - taskId como _id
   */
  const doc = await TaskModel.findOneAndUpdate(
    { _id: taskId, workspaceId },
    update,
    { new: true, runValidators: true }
  ).exec();

  return doc ? mapDocToTask(doc) : null;
}

/**
 * Elimina una task por id dentro del workspace.
 * Retorna boolean para que el controller pueda responder 404 vs ok.
 */
export async function deleteTaskInWorkspace(
  workspaceId: string,
  taskId: string
): Promise<boolean> {
  const doc = await TaskModel.findOneAndDelete({
    _id: taskId,
    workspaceId,
  }).exec();

  return doc !== null;
}

/**
 * Elimina todas las tasks del workspace.
 * Útil para:
 * - borrar workspace
 * - reset / limpieza de datos
 */
export async function deleteAllTasksInWorkspace(
  workspaceId: string
): Promise<number> {
  const result = await TaskModel.deleteMany({ workspaceId }).exec();
  return result.deletedCount ?? 0;
}
