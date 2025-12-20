import cors from "cors";
import express from "express";
import { authRouter } from "./auth/auth.routes";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFound";
import { rootRouter } from "./routes/root.routes";
import { todosRouter } from "./routes/todos.routes";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/", rootRouter);
app.use("/todos", todosRouter);

app.use("/auth", authRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
