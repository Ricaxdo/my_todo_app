// src/tasks/task.store.ts
import { TaskModel, type TaskDocument } from "./task.model";
import type { Priority, Task } from "./task.types";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
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

  // ✅ dueDate para FE (ISO o null)
  result.dueDate = doc.dueDate
    ? doc.dueDate instanceof Date
      ? doc.dueDate.toISOString()
      : new Date(doc.dueDate).toISOString()
    : null;

  return result;
}

export async function getWorkspaceTasks(
  workspaceId: string,
  selectedDate?: Date
): Promise<Task[]> {
  const date = selectedDate ?? new Date();

  const from = startOfDay(date);
  const to = endOfDay(date);

  const docs = await TaskModel.find({
    workspaceId,
    createdAt: { $lte: to },
    $or: [
      { dueDate: { $exists: false } }, // 👈 no dueDate = solo día creado
      { dueDate: { $gte: from } }, // 👈 persiste hasta dueDate
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
    dueDate?: string; // ISO
  }
): Promise<Task> {
  const doc = await TaskModel.create({
    text: input.text,
    priority: input.priority ?? "medium",
    category: input.category ?? "General",
    workspaceId,
    createdBy: userId,
    ...(input.dueDate ? { dueDate: new Date(input.dueDate) } : {}),
  });

  return mapDocToTask(doc);
}

export async function updateTaskInWorkspace(
  workspaceId: string,
  taskId: string,
  data: Partial<Pick<Task, "text" | "completed" | "priority" | "category">> & {
    dueDate?: string | null;
  }
): Promise<Task | null> {
  const setData: Record<string, unknown> = {};
  const unsetData: Record<string, unknown> = {};

  if (data.text !== undefined) setData.text = data.text;
  if (data.completed !== undefined) setData.completed = data.completed;
  if (data.priority !== undefined) setData.priority = data.priority;
  if (data.category !== undefined) setData.category = data.category;

  if (data.dueDate !== undefined) {
    if (data.dueDate) setData.dueDate = new Date(data.dueDate);
    else unsetData.dueDate = 1;
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
  // mongoose devuelve deletedCount (puede ser undefined)
  return result.deletedCount ?? 0;
}
