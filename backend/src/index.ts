import "dotenv/config";

import { env } from "./config/env";
import { connectDB } from "./db/connect";
import app from "./server";

async function bootstrap() {
  await connectDB();

  app.listen(env.port, () => {
    console.log(`[backend] Servidor corriendo en http://localhost:${env.port}`);
  });
}

bootstrap().catch((err) => {
  console.error("[backend] Error al iniciar:", err);
  process.exit(1);
});
