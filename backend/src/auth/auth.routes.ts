import { Router } from "express";
import { login, signup } from "./auth.controller";
import { loginValidation, signupValidation } from "./auth.validation";

export const authRouter = Router();

authRouter.post("/signup", signupValidation, signup);
authRouter.post("/login", loginValidation, login);
