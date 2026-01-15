import { Schema, model, type HydratedDocument, type Types } from "mongoose";

/**
 * ActivityType:
 * Catálogo de eventos que registramos en el "activity log" del sistema.
 * Sirve para auditoría, feed de actividad, debugging y analytics.
 *
 * Tip: Mantenerlos como strings estables (evita renombrarlos sin migración).
 */
export type ActivityType =
  | "todo.create"
  | "todo.toggle"
  | "todo.delete"
  | "todo.bulk_create"
  | "todo.bulk_complete"
  | "todo.bulk_delete"
  | "workspace.join"
  | "workspace.leave"
  | "workspace.delete"
  | "member.remove";

/**
 * ActivitySchema:
 * Documento de log de actividad (append-only).
 *
 * - workspaceId: scope del evento (a qué workspace pertenece)
 * - actorUserId: quién ejecutó la acción
 * - type/entity: clasificación rápida y filtrable
 * - meta: payload flexible (ids, conteos, etc.) sin romper el esquema
 * - createdAt: timestamp del evento (viene de timestamps)
 */
export type ActivitySchema = {
  workspaceId: Types.ObjectId;
  actorUserId: Types.ObjectId;

  type: ActivityType;
  entity: "todo" | "workspace" | "member";
  meta?: Record<string, unknown>;

  createdAt: Date;
};

const activitySchema = new Schema<ActivitySchema>(
  {
    /**
     * Workspace al que pertenece el evento.
     * Indexado porque el caso típico es: "dame la actividad de este workspace".
     */
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },

    /**
     * Usuario que realizó la acción (actor).
     * Indexado para consultas tipo: "actividad hecha por X" (auditoría / debugging).
     */
    actorUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /**
     * Tipo de evento. (ej. "todo.create")
     * Indexado porque es común filtrar por tipo en el feed.
     *
     */
    type: {
      type: String,
      required: true,
      index: true,
    },

    /**
     * Entidad principal afectada (para agrupar/filtrar rápido).
     */
    entity: {
      type: String,
      enum: ["todo", "workspace", "member"],
      required: true,
      index: true,
    },

    /**
     * Metadata flexible del evento (no contractual):
     * Ejemplos:
     * - { todoId, title }
     * - { removedUserId }
     * - { count: 12 }
     *
     * Mixed permite guardar estructuras variables sin migraciones.
     */
    meta: {
      type: Schema.Types.Mixed,
      required: false,
    },
  },
  {
    /**
     * timestamps:
     * - createdAt se guarda como "createdAt"
     * - no guardamos updatedAt porque un log debería ser inmutable (append-only)
     */
    timestamps: { createdAt: "createdAt", updatedAt: false },
  }
);

/**
 * Índice compuesto para el caso de uso más común:
 * listar actividad de un workspace en orden descendente por fecha.
 */
activitySchema.index({ workspaceId: 1, createdAt: -1 });

/** Tipo de documento hidratado (con métodos de Mongoose). */
export type ActivityDocument = HydratedDocument<ActivitySchema>;

/** Modelo exportable para queries/creates del activity log. */
export const ActivityModel = model<ActivitySchema>("Activity", activitySchema);
