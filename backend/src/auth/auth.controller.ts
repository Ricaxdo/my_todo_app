import type { NextFunction, Request, Response } from "express";
import { UserModel } from "../users/user.model";
import { signToken } from "./auth.utils";

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, lastName, phone, email, password } = req.body as {
      name?: string;
      lastName?: string;
      phone?: string;
      email?: string;
      password?: string;
    };

    // Validación básica
    if (!name || !lastName || !phone || !email || !password) {
      return res.status(400).json({ message: "missing required fields" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.replace(/\D/g, "");

    if (!/^\d{10}$/.test(cleanPhone)) {
      return res.status(400).json({ message: "invalid phone" });
    }

    const exists = await UserModel.exists({ email: cleanEmail });
    if (exists) {
      return res.status(409).json({ message: "email already exists" });
    }

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

    res.status(201).json({ token });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }

    const user = await UserModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const isValid = await user.comparePassword(password);

    if (!isValid) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    // 4️⃣ Generar token
    const token = signToken({
      _id: user._id.toString(),
      email: user.email,
    });

    // 5️⃣ Responder
    res.json({ token });
  } catch (err) {
    next(err);
  }
}
