// src/tasks/task.model.ts
import { Schema, model, type InferSchemaType } from "mongoose";

// Definimos el schema de la colección "tasks"
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
  },
  {
    // Esto agrega createdAt y updatedAt automáticamente
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

// Tipo TypeScript inferido desde el schema
export type TaskDocument = InferSchemaType<typeof taskSchema>;

// Modelo de Mongoose para interactuar con la colección "tasks"
export const TaskModel = model<TaskDocument>("Task", taskSchema);
