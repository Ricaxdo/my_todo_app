// src/db/connect.ts
import mongoose from "mongoose";

export async function connectDB() {
  const uri =
    process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/todo_dashboard";

  await mongoose.connect(uri);
  console.log("[db] Conectado a MongoDB");
}
