// src/tasks/task.model.ts
import { Schema, model, type InferSchemaType } from "mongoose";

const taskSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },

    // ✅ NUEVO: workspace
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },

    // ✅ NUEVO: audit mínimo
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ STEP 4: duración
    dueDate: {
      type: Date,
      required: false,
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
