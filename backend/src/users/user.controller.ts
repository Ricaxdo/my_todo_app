import { NextFunction, Request, Response } from "express";
import { UserModel } from "./user.model";

export async function listUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const users = await UserModel.find().select("name email phone");
    res.json({ users });
  } catch (err) {
    next(err);
  }
}
