import "dotenv/config";

import { env } from "./config/env";
import { connectDB } from "./db/connect";
import app from "./server";

async function bootstrap() {
  const port = Number(process.env.PORT) || env.port || 8080;

  app.listen(port, "0.0.0.0", () => {
    console.log(`[backend] Servidor corriendo en puerto ${port}`);
  });

  try {
    await connectDB();
    console.log("[backend] DB conectada");
  } catch (err) {
    console.error("[backend] Error conectando a DB:", err);
    // Si quieres forzar que se caiga si no hay DB, descomenta:
    // process.exit(1);
  }
}

bootstrap().catch((err) => {
  console.error("[backend] Error al iniciar:", err);
  process.exit(1);
});
