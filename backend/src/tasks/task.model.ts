// src/tasks/task.model.ts
import { Schema, model, type HydratedDocument, type Types } from "mongoose";

export type TaskSchema = {
  text: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  category: string;

  workspaceId: Types.ObjectId;
  createdBy: Types.ObjectId;

  dueDate?: Date | null;

  // temporal
  owner?: Types.ObjectId | null;

  // ✅ nuevo
  assignees: Types.ObjectId[];

  // timestamps
  createdAt: Date;
  updatedAt: Date;
};

const taskSchema = new Schema<TaskSchema>(
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

    dueDate: {
      type: Date,
      required: false,
      index: true,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },

    assignees: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false,
        index: true,
      },
    ],
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

export type TaskDocument = HydratedDocument<TaskSchema>;
export const TaskModel = model<TaskSchema>("Task", taskSchema);
