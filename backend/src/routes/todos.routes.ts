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
  id: string;
}

export const todosRouter = Router();

todosRouter.get("/", (req: Request, res: Response) => {
  res.json(getAllTasks());
});

todosRouter.post("/", (req: Request, res: Response) => {
  const { text, priority, category } = req.body;
  if (!text) {
    return res.status(400).json({ error: "El texto es requerido" });
  }

  const newTask: Task = createTask({ text, priority, category });
  res.status(201).json(newTask);
});

todosRouter.put("/:id", (req: Request<TaskParams>, res: Response) => {
  const id = Number.parseInt(req.params.id, 10);
  const updated = updateTask(id, req.body);

  if (!updated) {
    return res.status(404).json({ error: "Tarea no encontrada" });
  }

  res.json(updated);
});

todosRouter.delete("/:id", (req: Request<TaskParams>, res: Response) => {
  const id = Number.parseInt(req.params.id, 10);
  const removed = deleteTask(id);

  if (!removed) {
    return res.status(404).json({ error: "Tarea no encontrada" });
  }

  res.status(204).send();
});
