// src/tasks/task.store.ts
import { TaskModel, type TaskDocument } from "./task.model";
import type { Priority, Task } from "./task.types";

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

  return result;
}

// ✅ ahora: tasks del workspace
export async function getWorkspaceTasks(workspaceId: string): Promise<Task[]> {
  const docs = await TaskModel.find({ workspaceId })
    .sort({ createdAt: -1 })
    .exec();

  return docs.map(mapDocToTask);
}

export async function createTaskInWorkspace(
  workspaceId: string,
  userId: string,
  input: { text: string; priority?: Priority; category?: string }
): Promise<Task> {
  const doc = await TaskModel.create({
    text: input.text,
    priority: input.priority ?? "medium",
    category: input.category ?? "General",
    workspaceId,
    createdBy: userId,
  });

  return mapDocToTask(doc);
}

export async function updateTaskInWorkspace(
  workspaceId: string,
  taskId: string,
  data: Partial<Pick<Task, "text" | "completed" | "priority" | "category">>
): Promise<Task | null> {
  const updateData: Record<string, unknown> = {};

  if (data.text !== undefined) updateData.text = data.text;
  if (data.completed !== undefined) updateData.completed = data.completed;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.category !== undefined) updateData.category = data.category;

  const doc = await TaskModel.findOneAndUpdate(
    { _id: taskId, workspaceId }, // ✅ multi-user ahora por workspace
    updateData,
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
