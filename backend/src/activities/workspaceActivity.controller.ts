import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import { listWorkspaceActivity } from "./activity.store";

/**
 * Controller: GET /workspaces/:workspaceId/activity
 *
 * Responsabilidad:
 * - Extraer params/query del request
 * - Sanitizar/parsing básico (limit/before)
 * - Delegar la lógica de datos al store (listWorkspaceActivity)
 * - Responder JSON o pasar errores al errorHandler (next)
 */
export async function getWorkspaceActivity(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    /**
     * workspaceId viene del path param.
     * Ojo: aquí asumimos que el route/validator ya validó que sea un id válido.
     */
    const { workspaceId } = req.params as { workspaceId: string };

    /**
     * Query params:
     * - limit: string -> number (clamp real ocurre en el store)
     * - before: ISO string (cursor)
     */
    const { limit, before } = req.query as { limit?: string; before?: string };

    // Parse defensivo de limit (si no es número finito, se ignora).
    const parsedLimit = limit ? Number(limit) : NaN;

    // Sanitiza before: solo aceptamos string no vacío.
    const cleanBefore =
      typeof before === "string" && before.trim() ? before.trim() : null;

    /**
     * Construcción limpia de params:
     * - workspaceId siempre
     * - limit solo si parsedLimit es válido
     * - before solo si existe y no está vacío
     */
    const params = {
      workspaceId,
      ...(Number.isFinite(parsedLimit) ? { limit: parsedLimit } : {}),
      ...(cleanBefore ? { before: cleanBefore } : {}),
    };

    /**
     * Store devuelve { items, nextCursor } ya listo para el FE.
     * El controller solo lo devuelve tal cual.
     */
    const data = await listWorkspaceActivity(params);
    return res.json(data);
  } catch (err) {
    /**
     * Errores al middleware central (errorHandler):
     * mantiene respuestas consistentes (status/message).
     */
    return next(err);
  }
}
