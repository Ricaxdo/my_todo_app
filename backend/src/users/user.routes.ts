import { Router } from "express";
import { listUsers } from "./user.controller";

export const usersRouter = Router();

usersRouter.get("/", listUsers);
