import { errors } from "celebrate";
import cors from "cors";
import express from "express";

import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFound";

import { authRouter } from "./auth/auth.routes";
import { rootRouter } from "./routes/root.routes";
import { todosRouter } from "./routes/todo.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", rootRouter);
app.use("/todos", todosRouter);
app.use("/auth", authRouter);

app.use(notFoundHandler);

app.use(errors());

app.use(errorHandler);

export default app;
