import mongoose from "mongoose";
import { env } from "../config/env";

export async function connectDB() {
  await mongoose.connect(env.mongoUri);
  console.log("[db] Conectado a MongoDB");
}
