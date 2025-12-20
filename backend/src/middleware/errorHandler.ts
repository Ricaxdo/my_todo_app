import { isCelebrateError } from "celebrate";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // ✅ 1) Celebrate/Joi -> 400 con detalles por campo
  if (isCelebrateError(err)) {
    const details: Record<string, string[]> = {};

    for (const [, joiError] of err.details.entries()) {
      for (const d of joiError.details) {
        const key = (d.path?.join(".") || "field").toString();
        if (!details[key]) details[key] = [];
        details[key].push(d.message);
      }
    }

    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "invalid request",
        details,
      },
    });
  }

  // ✅ 2) AppError -> ya trae status + code
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
  }

  // ✅ 3) Errores Mongo Duplicate Key (email unique) -> 409
  if (err?.code === 11000) {
    const field =
      Object.keys(err.keyPattern ?? err.keyValue ?? {})[0] ?? "field";
    const message =
      field === "email" ? "email already exists" : `${field} already exists`;

    return res.status(409).json({
      error: {
        code: "DUPLICATE_RESOURCE",
        message,
      },
    });
  }

  // ✅ 4) Fallback -> 500 sin filtrar detalles
  console.error("[error]", err);

  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "internal server error",
    },
  });
}
