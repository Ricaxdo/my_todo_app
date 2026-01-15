import { isCelebrateError } from "celebrate";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";

/**
 * Middleware global de manejo de errores.
 *
 * Objetivo:
 * - Respuestas consistentes con shape { error: { code, message, details? } }
 * - Mapear errores comunes (validación, AppError, Mongo duplicate key)
 * - Ocultar detalles internos en 500 (seguridad)
 *
 *  */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  /**
   * 1) Celebrate/Joi => 400 (VALIDATION_ERROR) con detalles por campo.
   *
   * Estructura `details`:
   * - key: "body.email" o "params.workspaceId" etc (depende de cómo venga el path)
   * - value: array de mensajes (por si hay múltiples reglas por campo)
   */
  if (isCelebrateError(err)) {
    const details: Record<string, string[]> = {};

    // err.details es un Map<segment, JoiError>
    for (const [, joiError] of err.details.entries()) {
      for (const d of joiError.details) {
        // d.path es un array con la ruta del campo (ej: ["email"])
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

  /**
   * 2) AppError => error "controlado" de dominio.
   * AppError ya trae:
   * - status HTTP
   * - code (string estable para FE)
   * - message
   * - details opcional
   */
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
  }

  /**
   * 3) Mongo Duplicate Key => 409 (conflict)
   * Caso típico: email con unique index.
   *
   * err.code === 11000 es el código estándar de duplicate key en MongoDB.
   * keyPattern/keyValue ayudan a identificar el campo que chocó.
   */
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

  /**
   * 4) Fallback => 500
   * - Logueamos el error real en server
   * - Respondemos un mensaje genérico para no filtrar info interna
   */
  console.error("[error]", err);

  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "internal server error",
    },
  });
}
