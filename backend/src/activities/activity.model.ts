// src/activities/activity.model.ts
import { Schema, model, type HydratedDocument, type Types } from "mongoose";

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
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    actorUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      index: true,
    },
    entity: {
      type: String,
      enum: ["todo", "workspace", "member"],
      required: true,
      index: true,
    },
    meta: {
      type: Schema.Types.Mixed,
      required: false,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
  }
);

activitySchema.index({ workspaceId: 1, createdAt: -1 });

export type ActivityDocument = HydratedDocument<ActivitySchema>;
export const ActivityModel = model<ActivitySchema>("Activity", activitySchema);
