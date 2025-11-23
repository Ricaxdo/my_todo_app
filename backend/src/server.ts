// server.ts
import cors from "cors";
import express from "express";
import { notFoundHandler } from "./middleware/notFound";
import { rootRouter } from "./routes/root.routes";
import { todosRouter } from "./routes/todos.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", rootRouter);
app.use("/todos", todosRouter);

app.use(notFoundHandler);

export default app;
