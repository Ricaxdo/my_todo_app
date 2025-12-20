import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { unauthorized } from "../errors/AppError";

export type JwtPayload = {
  _id: string;
  email: string;
};

export type AuthRequest = Request & {
  user?: JwtPayload;
};

export function auth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.header("Authorization");

  if (!header || !header.startsWith("Bearer ")) {
    throw unauthorized("authorization required");
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    throw unauthorized("invalid or expired token");
  }
}
