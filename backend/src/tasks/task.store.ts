// src/tasks/task.store.ts
import { DateTime } from "luxon";
import { TaskModel, type TaskDocument } from "./task.model";
import type { Priority, Task } from "./task.types";

const DEFAULT_TZ = "America/Mexico_City";

/** Rango del día (start/end) en timezone tz -> convertido a JS Date (instantes UTC) */
function dayRangeInTz(day: Date, tz: string) {
  const dt = DateTime.fromJSDate(day, { zone: tz });
  const from = dt.startOf("day").toJSDate();
  const to = dt.endOf("day").toJSDate();
  return { from, to };
}

/** default: fin de HOY en tz (guardado como Date) */
function endOfTodayInTz(tz: string) {
  return DateTime.now().setZone(tz).endOf("day").toJSDate();
}

/**
 * Si viene ISO con hora -> lo respetamos.
 * Si viene solo fecha (YYYY-MM-DD) -> la tratamos como fin de ese día en tz.
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

function mapDocToTask(doc: TaskDocument & { _id: unknown }): Task {
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
  };

  if (doc.updatedAt) {
    const updatedAtIso =
      doc.updatedAt instanceof Date
        ? doc.updatedAt.toISOString()
        : new Date(doc.updatedAt).toISOString();
    result.updatedAt = updatedAtIso;
  }

  result.dueDate = doc.dueDate
    ? doc.dueDate instanceof Date
      ? doc.dueDate.toISOString()
      : new Date(doc.dueDate).toISOString()
    : null;

  return result;
}

/**
 * Opción B (timezone-safe):
 * - Un task "vive" en el día donde cae su dueDate (fin del día local por default).
 * - Para ver tasks de un día, filtramos dueDate dentro del rango (start/end) en tz.
 * - Legacy: tasks sin dueDate => solo aparecen el día que fueron creadas (rango en tz).
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
      // ✅ tasks “modernas”: aparecen en el día donde cae su dueDate
      { dueDate: { $gte: from, $lte: to } },

      // ✅ legacy: sin dueDate -> solo día de creación
      { dueDate: { $exists: false }, createdAt: { $gte: from, $lte: to } },
      { dueDate: null, createdAt: { $gte: from, $lte: to } },
    ],
  })
    .sort({ createdAt: -1 })
    .exec();

  return docs.map(mapDocToTask);
}

export async function createTaskInWorkspace(
  workspaceId: string,
  userId: string,
  input: {
    text: string;
    priority?: Priority;
    category?: string;
    dueDate?: string; // ISO o YYYY-MM-DD
  },
  tz: string = DEFAULT_TZ
): Promise<Task> {
  const due = input.dueDate
    ? parseDueDateInput(input.dueDate, tz)
    : endOfTodayInTz(tz);

  const doc = await TaskModel.create({
    text: input.text,
    priority: input.priority ?? "medium",
    category: input.category ?? "General",
    workspaceId,
    createdBy: userId,
    dueDate: due,
  });

  return mapDocToTask(doc);
}

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

  const update =
    Object.keys(unsetData).length === 0
      ? { $set: setData }
      : {
          ...(Object.keys(setData).length ? { $set: setData } : {}),
          $unset: unsetData,
        };

  const doc = await TaskModel.findOneAndUpdate(
    { _id: taskId, workspaceId },
    update,
    { new: true, runValidators: true }
  ).exec();

  return doc ? mapDocToTask(doc) : null;
}

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

export async function deleteAllTasksInWorkspace(
  workspaceId: string
): Promise<number> {
  const result = await TaskModel.deleteMany({ workspaceId }).exec();
  return result.deletedCount ?? 0;
}
