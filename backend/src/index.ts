import "dotenv/config";

import { connectDB } from "./db/connect";
import app from "./server";

async function bootstrap() {
  await connectDB();

  const port = Number(process.env.PORT) || 8080;

  app.listen(port, "0.0.0.0", () => {
    console.log(`[backend] Servidor corriendo en puerto ${port}`);
  });
}

bootstrap().catch((err) => {
  console.error("[backend] Error al iniciar:", err);
  process.exit(1);
});
