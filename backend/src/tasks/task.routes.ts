import { Router } from "express";
import { auth } from "../middleware/auth";

// controllers (los creamos después)
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "./task.controller";

export const taskRouter = Router();

// 🔒 Protege todo
taskRouter.use(auth);

// GET /tasks -> solo del user logueado
taskRouter.get("/", getTasks);

// POST /tasks -> crea con owner=req.user._id
taskRouter.post("/", createTask);

// PATCH /tasks/:id -> solo si pertenece al user
taskRouter.patch("/:id", updateTask);

// DELETE /tasks/:id -> solo si pertenece al user
taskRouter.delete("/:id", deleteTask);
