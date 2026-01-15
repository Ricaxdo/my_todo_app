import { Router } from "express";
import { auth } from "../middleware/auth";
import { deleteMe, login, me, signup } from "./auth.controller";
import { loginValidation, signupValidation } from "./auth.validation";

export const authRouter = Router();

authRouter.post("/signup", signupValidation, signup);
authRouter.post("/login", loginValidation, login);
authRouter.get("/me", auth, me);
authRouter.delete("/me", auth, deleteMe);
