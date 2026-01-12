import type { NextFunction, Response } from "express";
import mongoose from "mongoose";
import { unauthorized } from "../errors/AppError";
import { WorkspaceMemberModel } from "../members/workspaceMember.model";
import type { AuthRequest } from "../middleware/auth";
import { WorkspaceModel } from "./workspace.model";
import { countExtraWorkspacesForUser } from "./workspace.utils";

/**
 * Sanitiza/valida el nombre del workspace.
 * - Debe ser string
 * - trim()
 * - longitud mínima/máxima (2..60)
 *
 * Retorna null si no cumple (para responder 400).
 */
function cleanName(name: unknown): string | null {
  if (typeof name !== "string") return null;
  const n = name.trim();
  if (n.length < 2) return null;
  if (n.length > 60) return null;
  return n;
}

/**
 * Crea un workspace "extra" con retry en caso de colisión de inviteCode.
 *
 * Por qué existe:
 * - Tu schema genera inviteCode en pre("validate") para workspaces NO personales.
 * - inviteCode es unique => rara vez puede colisionar (duplicate key 11000).
 * - En ese caso reintentamos para que el usuario no vea un 409.
 *
 */
async function createWorkspaceWithRetry(input: {
  name: string;
  owner: mongoose.Types.ObjectId;
}) {
  const MAX_TRIES = 8;

  for (let i = 0; i < MAX_TRIES; i++) {
    try {
      // El schema genera inviteCode automáticamente aquí.
      return await WorkspaceModel.create({
        name: input.name,
        owner: input.owner,
        isPersonal: false,
      });
    } catch (err: any) {
      // Duplicate key => colisión de inviteCode (keyValue.inviteCode existe)
      if (err?.code === 11000 && err?.keyValue?.inviteCode) {
        continue; // reintentar (se generará un nuevo inviteCode)
      }
      throw err;
    }
  }

  // Si después de varios intentos sigue fallando, es un caso anómalo.
  throw new Error("could not generate unique invite code");
}

/* =========================
   POST /workspaces
========================= */
/**
 * Crea un workspace extra (no personal).
 *
 * Reglas de negocio (MVP):
 * - Límite: personal + 1 extra (máx 2 workspaces totales por usuario)
 * - Crea también membership con role=owner
 */
export async function createWorkspace(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userIdRaw = req.user?._id;
    if (!userIdRaw) throw unauthorized("authorization required");

    // Normalizamos el userId a ObjectId para queries consistentes.
    const userId = new mongoose.Types.ObjectId(userIdRaw);

    /**
     * Límite de workspaces extra:
     * - personal siempre existe (por signup)
     * - permitimos 1 adicional (extraCount >= 1 => conflict)
     */
    const extraCount = await countExtraWorkspacesForUser(userId);
    if (extraCount >= 1) {
      return res.status(409).json({
        message: "Solo puedes tener 2 workspaces (personal + 1 adicional).",
      });
    }

    // Validación del nombre.
    const name = cleanName((req.body as any)?.name);
    if (!name) {
      return res.status(400).json({
        message: "name must be a string between 2 and 60 characters",
      });
    }

    // Crea workspace con retry para evitar fallos por inviteCode duplicado.
    const workspace = await createWorkspaceWithRetry({ name, owner: userId });

    /**
     * Crea la membership del owner.
     * joinedAt se guarda para auditoría / UI ("joined on").
     */
    await WorkspaceMemberModel.create({
      workspaceId: workspace._id,
      userId,
      role: "owner",
      joinedAt: new Date(),
    });

    // DTO hacia el cliente (no exponemos internals de Mongo).
    return res.status(201).json({
      workspace: {
        id: workspace._id.toString(),
        name: workspace.name,
        owner: workspace.owner.toString(),
        inviteCode: workspace.inviteCode,
        isPersonal: workspace.isPersonal,
      },
    });
  } catch (err) {
    return next(err);
  }
}

/* =========================
   POST /workspaces/join
========================= */
/**
 * Une al usuario a un workspace por inviteCode.
 *
 * Reglas:
 * - Respeta el mismo límite: personal + 1 extra
 * - No se puede unir a un workspace personal
 * - upsert membership:
 *   - si no existe, crea { joinedAt, role: "member" }
 *   - si ya existe, no sobreescribe role ni joinedAt (setOnInsert)
 */
export async function joinWorkspace(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userIdRaw = req.user?._id;
    if (!userIdRaw) throw unauthorized("authorization required");

    const userId = new mongoose.Types.ObjectId(userIdRaw);

    // Este check es redundante (userId siempre existe si llegaste aquí).
    if (!userId) throw unauthorized("authorization required");

    // Límite: personal + 1 extra
    const extraCount = await countExtraWorkspacesForUser(userId);
    if (extraCount >= 1) {
      return res.status(409).json({
        message: "Solo puedes tener 2 workspaces (personal + 1 adicional).",
      });
    }

    /**
     * Invite code:
     * - trim
     * - uppercase (normaliza para búsquedas)
     */
    const { code } = req.body as { code?: string };
    const clean = code?.trim().toUpperCase();
    if (!clean) {
      return res.status(400).json({ message: "code is required" });
    }

    // Busca workspace por inviteCode.
    const workspace = await WorkspaceModel.findOne({
      inviteCode: clean,
    }).exec();

    if (!workspace) {
      return res.status(404).json({ message: "workspace not found" });
    }

    // Seguridad/regla: un personal workspace no es joinable.
    if (workspace.isPersonal) {
      return res
        .status(400)
        .json({ message: "cannot join a personal workspace" });
    }

    /**
     * Upsert membership:
     * - Si el user ya está unido, no hacemos cambios destructivos.
     * - Si no, se crea membership con role member.
     */
    await WorkspaceMemberModel.updateOne(
      { workspaceId: workspace._id, userId },
      { $setOnInsert: { joinedAt: new Date(), role: "member" } },
      { upsert: true }
    ).exec();

    return res.json({
      workspace: {
        id: workspace._id.toString(),
        name: workspace.name,
        owner: workspace.owner.toString(),
        inviteCode: workspace.inviteCode,
        isPersonal: workspace.isPersonal,
      },
    });
  } catch (err) {
    return next(err);
  }
}

/* =========================
   GET /workspaces
========================= */
/**
 * Lista los workspaces del usuario (por memberships).
 *
 * Estrategia:
 * - 1) obtenemos memberships -> workspaceIds
 * - 2) buscamos workspaces por _id:$in
 *
 * Orden:
 * - personal primero (isPersonal desc)
 * - luego por createdAt desc
 *
 * Seguridad:
 * - inviteCode solo se expone si NO es personal
 */
export async function listMyWorkspaces(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?._id;
    if (!userId) throw unauthorized("authorization required");

    // IDs de workspaces donde el user es miembro.
    const memberships = await WorkspaceMemberModel.find({ userId })
      .select("workspaceId")
      .lean()
      .exec();

    const workspaceIds = memberships.map((m) => m.workspaceId);

    // Traemos datos del workspace (sin traer membresías completas).
    const workspaces = await WorkspaceModel.find({
      _id: { $in: workspaceIds },
    })
      .sort({ isPersonal: -1, createdAt: -1 })
      .lean()
      .exec();

    return res.json({
      workspaces: workspaces.map((w) => ({
        id: w._id.toString(),
        name: w.name,
        owner: w.owner.toString(),
        isPersonal: w.isPersonal ?? false,
        inviteCode: w.isPersonal ? null : w.inviteCode,
      })),
    });
  } catch (err) {
    return next(err);
  }
}
