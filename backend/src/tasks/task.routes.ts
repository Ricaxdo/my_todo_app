import { Router } from "express";
import { auth } from "../middleware/auth";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "../tasks/task.controller";

export const taskRoutes = Router();

taskRoutes.use(auth);

taskRoutes.get("/", getTasks);
taskRoutes.post("/", createTask);
taskRoutes.put("/:id", updateTask);
taskRoutes.delete("/:id", deleteTask);
