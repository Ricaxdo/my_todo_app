import app from "./server";

const port = process.env.PORT ?? 4000;

app.listen(port, () => {
  console.log(`[backend] Server running on http://localhost:${port}`);
});
