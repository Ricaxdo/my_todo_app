import mongoose from "mongoose";
import { UserModel } from "../users/user.model";
import { ActivityModel, type ActivityType } from "./activity.model";
import type { ActivityItem, ActivityListResponse } from "./activity.types";

/**
 * Helper para normalizar ids (string -> ObjectId) en queries/inserts.
 * Mantenerlo central evita repetir new ObjectId(...) y reduce errores.
 *
 */
function toObjectId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

/**
 * Crea un evento de actividad (append-only).
 * - No retorna nada porque típicamente es "fire-and-forget" del lado del request.
 * - meta se fuerza a {} para no guardar null y evitar checks en el FE.
 */
export async function createActivity(input: {
  workspaceId: string;
  actorUserId: string;
  type: ActivityType;
  entity: "todo" | "workspace" | "member";
  meta?: Record<string, unknown>;
}) {
  await ActivityModel.create({
    workspaceId: toObjectId(input.workspaceId),
    actorUserId: toObjectId(input.actorUserId),
    type: input.type,
    entity: input.entity,
    meta: input.meta ?? {},
  });
}

/**
 * Lista la actividad de un workspace con paginación por cursor.
 *
 * Estrategia:
 * - Orden: createdAt DESC (más reciente primero)
 * - Cursor: `before` (ISO string) => createdAt < before
 * - limit+1: pedimos uno extra para saber si hay "next page"
 *
 * Retorna:
 * - items: lista de ActivityItem ya "hydrated" (actor incluido)
 * - nextCursor: ISO de createdAt del último item devuelto (o null si no hay más)
 */
export async function listWorkspaceActivity(params: {
  workspaceId: string;
  limit?: number;
  before?: string; // ISO cursor (createdAt)
}): Promise<ActivityListResponse> {
  /**
   * Clamp defensivo para no permitir abuso:
   * - default 30
   * - mínimo 1
   * - máximo 100
   */
  const limit = Math.max(1, Math.min(params.limit ?? 30, 100));

  /**
   * Filtro base: scope por workspaceId.
   * Usamos Record<string, unknown> para poder agregar createdAt condicional.
   */
  const filter: Record<string, unknown> = {
    workspaceId: toObjectId(params.workspaceId),
  };

  /**
   * Cursor: si viene "before" y es una fecha válida, filtramos createdAt < before.
   * Eso permite paginar hacia atrás en el tiempo sin usar skip.
   */
  if (params.before) {
    const d = new Date(params.before);
    if (!Number.isNaN(d.getTime())) {
      filter.createdAt = { $lt: d };
    }
  }

  /**
   * Query principal:
   * - sort DESC por createdAt
   * - limit+1 para detectar si existe siguiente página
   * - lean() para performance (objetos planos, no documentos Mongoose)
   */
  const docs = await ActivityModel.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit + 1) // para saber si hay next page
    .lean()
    .exec();

  const slice = docs.slice(0, limit);
  const hasMore = docs.length > limit;

  /**
   * "Join" manual de actores:
   * - sacamos IDs únicos (Set) para hacer 1 query a UserModel (evitamos N+1)
   */
  const actorIds = Array.from(new Set(slice.map((d) => String(d.actorUserId))));

  /**
   * Traemos SOLO los campos que necesita el FE para render del feed.
   * (name/lastName/email). Mantener select corto mejora performance.
   */
  const users = await UserModel.find({ _id: { $in: actorIds } })
    .select("name lastName email")
    .lean()
    .exec();

  /**
   * Mapa id -> actor, para resolver rápido en el map() de items.
   * Si falta el usuario (deleted user / inconsistencia), caemos a "Unknown".
   */
  const userMap = new Map(
    users.map((u) => {
      const actor: {
        userId: string;
        name: string;
        lastName?: string;
        email?: string;
      } = {
        userId: String(u._id),
        name: String(u.name ?? ""),
      };

      if (u.lastName) actor.lastName = String(u.lastName);
      if (u.email) actor.email = String(u.email);

      return [String(u._id), actor] as const;
    })
  );

  /**
   * Guard: (NO se usa ahora mismo)
   * Si quieres “sin any”, úsalo para validar d.entity antes de mapear.
   * Ahorita quedó muerto y se puede borrar.
   */
  function isActivityEntity(x: unknown): x is "todo" | "workspace" | "member" {
    return x === "todo" || x === "workspace" || x === "member";
  }

  /**
   * Normalización a ActivityItem:
   * - ids a string
   * - createdAt a ISO string
   * - actor embebido (ya resuelto)
   *
   */
  const items: ActivityItem[] = slice.map((d) => {
    const actorId = String(d.actorUserId);
    const actor = userMap.get(actorId) ?? {
      userId: actorId,
      name: "Unknown",
    };

    return {
      id: String(d._id),
      workspaceId: String(d.workspaceId),
      type: d.type as any,
      entity: d.entity as any,
      actor,
      meta: (d.meta ?? undefined) as any,
      createdAt:
        d.createdAt instanceof Date
          ? d.createdAt.toISOString()
          : String(d.createdAt),
    };
  });

  /**
   * Cursor de siguiente página:
   * Si hay más, usamos el createdAt del último item devuelto.
   * (Porque nuestra condición de paginación es createdAt < cursor)
   */
  const nextCursor = hasMore
    ? items[items.length - 1]?.createdAt ?? null
    : null;

  return { items, nextCursor };
}
