import { Router } from "express";
import { signup } from "./auth.controller";

export const authRouter = Router();

authRouter.post("/signup", signup);
