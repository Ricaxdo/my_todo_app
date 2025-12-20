import type { NextFunction, Request, Response } from "express";
import { unauthorized } from "../errors/AppError";
import { UserModel } from "../users/user.model";
import { signToken } from "./auth.utils";

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, lastName, phone, email, password } = req.body as {
      name: string;
      lastName: string;
      phone: string;
      email: string;
      password: string;
    };

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.replace(/\D/g, ""); // guardamos 10 dígitos

    const user = await UserModel.create({
      name: name.trim(),
      lastName: lastName.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      password,
    });

    const token = signToken({
      _id: user._id.toString(),
      email: user.email,
    });

    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const cleanEmail = email.trim().toLowerCase();

    const user = await UserModel.findOne({ email: cleanEmail }).select(
      "+password"
    );

    if (!user) throw unauthorized("invalid credentials");

    const isValid = await user.comparePassword(password);
    if (!isValid) throw unauthorized("invalid credentials");

    const token = signToken({
      _id: user._id.toString(),
      email: user.email,
    });

    return res.json({ token });
  } catch (err) {
    return next(err);
  }
}
