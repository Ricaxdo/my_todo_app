// src/routes/todos.routes.ts
import { Router, type Request, type Response } from "express";
import {
  createTask,
  deleteTask,
  getAllTasks,
  updateTask,
} from "../tasks/task.store";
import type { Task } from "../tasks/task.types";

interface TaskParams {
  id: string; // ObjectId como string
}

export const todosRouter = Router();

todosRouter.get("/", async (req: Request, res: Response) => {
  try {
    const tasks = await getAllTasks();
    res.json(tasks);
  } catch (err) {
    console.error("[todos] Error en GET /todos:", err);
    res.status(500).json({ error: "Error al obtener tareas" });
  }
});

todosRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { text, priority, category } = req.body;
    if (!text) {
      return res.status(400).json({ error: "El texto es requerido" });
    }

    const newTask: Task = await createTask({ text, priority, category });
    res.status(201).json(newTask);
  } catch (err) {
    console.error("[todos] Error en POST /todos:", err);
    res.status(500).json({ error: "Error al crear tarea" });
  }
});

todosRouter.put("/:id", async (req: Request<TaskParams>, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await updateTask(id, req.body);

    if (!updated) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }

    res.json(updated);
  } catch (err) {
    console.error("[todos] Error en PUT /todos/:id:", err);
    res.status(500).json({ error: "Error al actualizar tarea" });
  }
});

todosRouter.delete("/:id", async (req: Request<TaskParams>, res: Response) => {
  try {
    const { id } = req.params;
    const removed = await deleteTask(id);

    if (!removed) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }

    res.status(204).send();
  } catch (err) {
    console.error("[todos] Error en DELETE /todos/:id:", err);
    res.status(500).json({ error: "Error al borrar tarea" });
  }
});
