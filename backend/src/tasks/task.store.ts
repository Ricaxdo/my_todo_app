// src/tasks/task.store.ts
import { TaskModel, type TaskDocument } from "./task.model";
import type { Priority, Task } from "./task.types";

function mapDocToTask(doc: TaskDocument & { _id: unknown }): Task {
  let createdAtIso: string;

  if (doc.createdAt instanceof Date) {
    createdAtIso = doc.createdAt.toISOString();
  } else if (doc.createdAt) {
    createdAtIso = new Date(doc.createdAt).toISOString();
  } else {
    createdAtIso = new Date().toISOString();
  }

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

// ✅ Antes: getAllTasks()
// ✅ Ahora: solo tasks del usuario logueado
export async function getMyTasks(userId: string): Promise<Task[]> {
  const docs = await TaskModel.find({ owner: userId })
    .sort({ createdAt: -1 })
    .exec();

  return docs.map(mapDocToTask);
}

// ✅ Crear task SIEMPRE con owner del backend
export async function createTaskForUser(
  userId: string,
  input: { text: string; priority?: Priority; category?: string }
): Promise<Task> {
  const doc = await TaskModel.create({
    text: input.text,
    priority: input.priority ?? "medium",
    category: input.category ?? "General",
    owner: userId, // ✅ clave
  });

  return mapDocToTask(doc);
}

/**
 * Actualiza SOLO campos mutables.
 * (text, completed, priority, category)
 * ✅ y SOLO si la task pertenece al user
 */
export async function updateTaskForUser(
  userId: string,
  taskId: string,
  data: Partial<Pick<Task, "text" | "completed" | "priority" | "category">>
): Promise<Task | null> {
  const updateData: Record<string, unknown> = {};

  if (data.text !== undefined) updateData.text = data.text;
  if (data.completed !== undefined) updateData.completed = data.completed;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.category !== undefined) updateData.category = data.category;

  const doc = await TaskModel.findOneAndUpdate(
    { _id: taskId, owner: userId }, // ✅ filtro multi-user
    updateData,
    { new: true, runValidators: true }
  ).exec();

  if (!doc) return null;
  return mapDocToTask(doc);
}

// ✅ borrar SOLO si pertenece al user
export async function deleteTaskForUser(
  userId: string,
  taskId: string
): Promise<boolean> {
  const doc = await TaskModel.findOneAndDelete({
    _id: taskId,
    owner: userId,
  }).exec();

  return doc !== null;
}
