import type { NextFunction, Response } from "express";
import mongoose from "mongoose";
import { unauthorized } from "../errors/AppError";
import { WorkspaceMemberModel } from "../members/workspaceMember.model";
import type { AuthRequest } from "../middleware/auth";

/**
 * Middleware de autorización por workspace.
 *
 * Objetivo:
 * - Asegurar que el usuario autenticado sea miembro del workspace
 *   indicado en req.params.workspaceId.
 *
 * Uso típico:
 * router.use("/workspaces/:workspaceId", auth, requireWorkspaceMember, ...)
 */
export async function requireWorkspaceMember(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    /**
     * Auth:
     * userId es inyectado por el middleware auth().
     */
    const userId = req.user?._id;
    if (!userId) throw unauthorized("authorization required");

    /**
     * workspaceId debe venir en params.
     * (Este middleware asume rutas con :workspaceId)
     */
    const { workspaceId } = req.params as { workspaceId?: string };
    if (!workspaceId) {
      return res.status(400).json({ message: "workspaceId is required" });
    }

    /**
     * Validación defensiva:
     * Evita queries innecesarias y errores de casting en Mongo.
     */
    if (!mongoose.isValidObjectId(workspaceId)) {
      return res.status(400).json({ message: "invalid workspaceId" });
    }

    /**
     * Checamos existencia de membership:
     * - exists() es más eficiente que findOne cuando solo importa saber si existe.
     */
    const exists = await WorkspaceMemberModel.exists({
      workspaceId,
      userId,
    });

    /**
     * Si no es miembro, bloqueamos acceso.
     * 403 => autenticado pero sin permisos sobre este recurso.
     */
    if (!exists) {
      return res.status(403).json({ message: "workspace access denied" });
    }

    // OK: el usuario pertenece al workspace.
    return next();
  } catch (err) {
    return next(err);
  }
}
