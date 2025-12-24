// src/tasks/task.model.ts
import { Schema, model, type InferSchemaType } from "mongoose";

function endOfTodayLocal() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

const taskSchema = new Schema(
  {
    text: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    category: { type: String, default: "General", trim: true },

    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ default al fin de HOY (local del server)
    dueDate: {
      type: Date,
      required: false,
      index: true,
    },

    // 🟡 TEMPORAL
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

export type TaskDocument = InferSchemaType<typeof taskSchema>;
export const TaskModel = model<TaskDocument>("Task", taskSchema);
