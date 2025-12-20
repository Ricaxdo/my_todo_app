import type { NextFunction, Request, Response } from "express";
import { UserModel } from "../users/user.model";
import { signToken } from "./auth.utils";

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    // 1) Validación básica
    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }

    // 2) Verificar duplicado
    const exists = await UserModel.exists({ email });
    if (exists) {
      return res.status(409).json({ message: "email already exists" });
    }

    // 3) Crear usuario (password se hashea en el model)
    const user = await UserModel.create({ email, password });

    // 4) Firmar token
    const token = signToken({
      _id: user._id.toString(),
      email: user.email,
    });

    // 5) Respuesta
    res.status(201).json({ token });
  } catch (err) {
    next(err);
  }
}
