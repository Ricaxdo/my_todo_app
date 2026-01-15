import { errors } from "celebrate";
import cors from "cors";
import express from "express";

import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFound";

import { authRouter } from "./auth/auth.routes";
import { rootRouter } from "./routes/root.routes";
import { taskRoutes } from "./tasks/task.routes";
import { workspaceTodosRoutes } from "./todo/workspaceTodos.routes";
import { workspaceRoutes } from "./workspaces/workspace.routes";

const app = express();

const corsOptions: cors.CorsOptions = {
  origin: (origin, cb) => {
    const allowed = (process.env.CORS_ORIGIN ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // Permite requests sin origin (Postman, curl, health checks)
    if (!origin) return cb(null, true);

    // Si no configuras CORS_ORIGIN, permite todo (fallback dev)
    if (allowed.length === 0) return cb(null, true);

    return allowed.includes(origin)
      ? cb(null, true)
      : cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: false, // ✅ OK si usas Authorization: Bearer
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Timezone", "x-tz"],
};

app.use(cors(corsOptions));

// ✅ CLAVE: responder preflight para todas las rutas
app.options("*", cors(corsOptions));

app.use(express.json());

app.use("/", rootRouter);
app.use("/todos", taskRoutes);

app.use("/workspaces", workspaceRoutes);
app.use("/workspaces", workspaceTodosRoutes);
app.use("/auth", authRouter);

app.get("/health", (_req, res) => res.status(200).json({ ok: true }));

app.use(notFoundHandler);
app.use(errors());
app.use(errorHandler);

export default app;
