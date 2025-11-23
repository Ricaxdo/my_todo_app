// src/tasks/task.store.ts
import { TaskModel, type TaskDocument } from "./task.model";
import type { Priority, Task } from "./task.types";

function mapDocToTask(doc: TaskDocument & { _id: unknown }): Task {
  // --- createdAt: garantizado por mongoose, pero hacemos guard por TS ---
  let createdAtIso: string;

  if (doc.createdAt instanceof Date) {
    createdAtIso = doc.createdAt.toISOString();
  } else if (doc.createdAt) {
    // aquí TS ya sabe que no es undefined
    createdAtIso = new Date(doc.createdAt).toISOString();
  } else {
    // fallback ultra-defensivo, no debería pasar en docs reales
    createdAtIso = new Date().toISOString();
  }

  const result: Task = {
    id: String(doc._id),
    text: doc.text,
    completed: doc.completed,
    priority: doc.priority,
    category: doc.category,
    createdAt: createdAtIso,
    // NO ponemos updatedAt aquí de inicio
  };

  // --- updatedAt: solo la agregamos si existe ---
  if (doc.updatedAt) {
    let updatedAtIso: string;

    if (doc.updatedAt instanceof Date) {
      updatedAtIso = doc.updatedAt.toISOString();
    } else {
      updatedAtIso = new Date(doc.updatedAt).toISOString();
    }

    result.updatedAt = updatedAtIso;
  }

  return result;
}

export async function getAllTasks(): Promise<Task[]> {
  const docs = await TaskModel.find().sort({ createdAt: -1 }).exec();
  return docs.map(mapDocToTask);
}

export async function createTask(input: {
  text: string;
  priority?: Priority;
  category?: string;
}): Promise<Task> {
  const doc = await TaskModel.create({
    text: input.text,
    priority: input.priority ?? "medium",
    category: input.category ?? "General",
  });

  return mapDocToTask(doc);
}

/**
 * Actualiza SOLO campos mutables.
 * (text, completed, priority, category)
 */
export async function updateTask(
  id: string,
  data: Partial<Pick<Task, "text" | "completed" | "priority" | "category">>
): Promise<Task | null> {
  const updateData: Record<string, unknown> = {};

  if (data.text !== undefined) updateData.text = data.text;
  if (data.completed !== undefined) updateData.completed = data.completed;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.category !== undefined) updateData.category = data.category;

  const doc = await TaskModel.findByIdAndUpdate(id, updateData, {
    new: true,
  }).exec();

  if (!doc) return null;
  return mapDocToTask(doc);
}

export async function deleteTask(id: string): Promise<boolean> {
  const doc = await TaskModel.findByIdAndDelete(id).exec();
  return doc !== null;
}
