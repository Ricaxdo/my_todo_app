import "dotenv/config";

import { env } from "./config/env";
import { connectDB } from "./db/connect";
import app from "./server";

async function bootstrap() {
  const port = Number(process.env.PORT) || env.port || 8080;

  app.listen(port, "0.0.0.0", () => {
    console.log(`[backend] Servidor corriendo en puerto ${port}`);
  });

  // Conecta DB después de levantar el server (Cloud Run ya verá el puerto)
  try {
    await connectDB();
    console.log("[backend] DB conectada");
  } catch (err) {
    console.error("[backend] No se pudo conectar a DB:", err);
    // En producción puedes decidir si matar el proceso o no:
    // process.exit(1);
  }
}

bootstrap().catch((err) => {
  console.error("[backend] Error al iniciar:", err);
  process.exit(1);
});
