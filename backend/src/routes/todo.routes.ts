// src/routes/todo.routes.ts
import { Router } from "express";
import { auth } from "../middleware/auth";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "../tasks/task.controller";

console.log("[todo.routes] LOADED FROM:", __filename);
console.log("[todo.routes] HANDLERS:", {
  getTasks: typeof getTasks,
  createTask: typeof createTask,
  updateTask: typeof updateTask,
  deleteTask: typeof deleteTask,
});

export const todosRouter = Router();

todosRouter.use(auth);

todosRouter.get("/", getTasks);
todosRouter.post("/", createTask);
todosRouter.put("/:id", updateTask);
todosRouter.delete("/:id", deleteTask);
