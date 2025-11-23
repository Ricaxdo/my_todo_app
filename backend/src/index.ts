import { connectDB } from "./db/connect";
import app from "./server";

const port = 4000;

async function bootstrap() {
  await connectDB();

  app.listen(port, () => {
    console.log(`[backend] Servidor corriendo en http://localhost:${port}`);
  });
}

bootstrap().catch((err) => {
  console.error("[backend] Error al iniciar:", err);
  process.exit(1);
});
