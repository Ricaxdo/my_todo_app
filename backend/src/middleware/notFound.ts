import type { NextFunction, Request, Response } from "express";

export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const acceptsHtml = req.accepts("html");
  const acceptsJson = req.accepts("json");

  // 🟢 Caso API / Frontend
  if (acceptsJson && !acceptsHtml) {
    return res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: "route not found",
      },
    });
  }

  return res.status(404).type("html").send(`<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>404 · Route Not Found</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root { color-scheme: dark; }
      * { box-sizing: border-box; }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
        background: rgba(10, 10, 10, 1);
        color: #e5e7eb;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
      }

      .grid-bg {
        position: fixed;
        inset: 0;
        pointer-events: none;
        opacity: 0.12;
        z-index: -1;
      }

      .card {
        max-width: 700px;
        width: 100%;
        border-radius: 1.5rem;
        border: 0px solid rgba(0, 0, 0, 1);
        background: rgba(5, 5, 5, 1);
        padding: 2rem 2rem 1.75rem;
        box-shadow:
          0 0px 40px rgba(255, 255, 255, 0.2),
          0 0 0 1px rgba(255, 255, 255, 0);
      }

      .eyebrow {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.16em;
        color: #9ca3af;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
      }

      .pill {
        width: 1.4rem;
        height: 1.4rem;
        border-radius: 999px;
        border: 1px solid rgba(248, 113, 113, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.85rem;
        color: #fecaca;
      }

      h1 {
        margin: 0.9rem 0 0.35rem;
        font-size: clamp(2rem, 3.2vw, 2.6rem);
        letter-spacing: -0.06em;
        background: linear-gradient(to bottom, #ffffffff, #949494ff);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }

      .sub {
        font-size: 0.9rem;
        color: #9ca3af;
        margin-bottom: 1rem;
      }

      .path-tag {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.3rem 0.7rem;
        font-size: 0.75rem;
        border-radius: 999px;
        background: #2e589cff;
        color: #e5e7eb;
        margin-bottom: 1.3rem;
      }

      .path-tag code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        font-size: 0.75rem;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.6rem;
        margin-bottom: 1.2rem;
      }

      .btn {
        padding: 0.55rem 0.9rem;
        border-radius: 999px;
        font-size: 0.8rem;
        background: #2e589cff;
        color: #e5e7eb;
        text-decoration: none;
      }

      .meta {
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
        font-size: 0.75rem;
        color: #6b7280;
        flex-wrap: wrap;
      }

      .meta span code {
        font-size: 0.75rem;
      }
    </style>
  </head>
  <body>
    <div class="grid-bg"></div>
    <div class="card">
      <div class="eyebrow">
        <span class="pill">!</span>
        Route not found
      </div>
      <h1>Esta ruta no existe en tu API.</h1>
      <p class="sub">
        Estás consultando un endpoint que tu servidor Express aún no expone.
        Revisa la ruta o vuelve a uno de los recursos disponibles.
      </p>

      <div class="path-tag">
        Ruta solicitada:
        <code>${req.path}</code>
      </div>

      <div class="actions">
        <a href="/" class="btn">Volver al root de la API</a>
        <a href="/todos" class="btn">Ver lista de todos</a>
      </div>

      <div class="meta">
        <span>Disponible: <code>GET /todos</code>, <code>POST /todos</code>, <code>PUT /todos/:id</code>, <code>DELETE /todos/:id</code></span>
        <span>Backend · Express + TypeScript · Port 4000</span>
      </div>
    </div>
  </body>
</html>`);
}
