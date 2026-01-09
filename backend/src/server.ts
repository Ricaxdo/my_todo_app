import { errors } from "celebrate";
import cors from "cors";
import express from "express";

import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFound";

import { authRouter } from "./auth/auth.routes";
import { rootRouter } from "./routes/root.routes";
import { taskRoutes } from "./tasks/task.routes";
import { workspaceRoutes } from "./workspaces/workspace.routes";
import { workspaceTodosRoutes } from "./workspaces/workspaceTodos.routes";

const app = express();

app.use(
  cors({
    origin: true, // o tu dominio FE
    credentials: false,
    allowedHeaders: ["Content-Type", "Authorization", "X-Timezone", "x-tz"],
  })
);
app.use(express.json());

app.use("/", rootRouter);
app.use("/todos", taskRoutes); // compat personal

app.use("/workspaces", workspaceRoutes);
app.use("/workspaces", workspaceTodosRoutes); // shared by workspace
app.use("/auth", authRouter);

app.use(notFoundHandler);
app.use(errors());
app.use(errorHandler);

export default app;
