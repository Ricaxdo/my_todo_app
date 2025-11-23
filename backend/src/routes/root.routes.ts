// src/routes/root.routes.ts
import { Router, type Request, type Response } from "express";

export const rootRouter = Router();

rootRouter.get("/", (req: Request, res: Response) => {
  res.type("html").send(`<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Todo API · Backend</title>
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
        padding: 2.5rem 1.5rem;
      }

      .grid-bg {
        position: fixed;
        inset: 0;
        pointer-events: none;
        opacity: 0.12;
        z-index: -1;
        background-image:
          linear-gradient(to right, rgba(60,60,60,0.12) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(60,60,60,0.12) 1px, transparent 1px);
        background-size: 40px 40px;
      }

      .card {
        max-width: 880px;
        width: 100%;
        border-radius: 1.5rem;
        border: 0px solid rgba(0, 0, 0, 1);
        background: rgba(5, 5, 5, 1);
        padding: 2.4rem 2rem 2rem;
        box-shadow:
          0 0px 40px rgba(255, 255, 255, 0.2),
          0 0 0 1px rgba(255, 255, 255, 0);
      }

      .badge {
        font-size: 0.70rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #9ca3af;
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.32rem 0.75rem;
        border-radius: 999px;
        background: #0a0a0aff;
        border: 1px solid rgba(120,120,120,0.35);
      }

      .badge-dot {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 999px;
        background: #22c55e;
      }

      h1 {
        margin: 1.4rem 0 0.6rem;
        font-size: clamp(2.6rem, 4vw, 3.4rem);
        font-weight: 800;
        letter-spacing: -0.05em;
        background: linear-gradient(to bottom, #ffffffff, #b5b5b5ff);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }

      p.subtitle {
        margin-top: 0.5rem;
        max-width: 34rem;
        font-size: 1rem;
        color: #9ca3af;
        line-height: 1.6;
      }

      .pill-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 1.6rem;
      }

      .pill {
        padding: 0.35rem 0.85rem;
        border-radius: 999px;
        background: #2e589cff;
        color: #ffffffdd;
        font-size: 0.75rem;
        font-weight: 500;
      }

      .section {
        margin-top: 2rem;
        background: #0d0d0d;
        border-radius: 1.25rem;
        border: 1px solid rgba(255,255,255,0.05);
        padding: 1.6rem 1.4rem;
        box-shadow: 0 0px 20px rgba(10, 10, 12, 0.4);
      }

      .section-title {
        font-size: 0.8rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #9ca3af;
        margin-bottom: 0.8rem;
      }

      .link-row {
        margin-top: 0.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .endpoint {
        padding: 0.65rem 0.9rem;
        border-radius: 0.6rem;
        background: #111;
        border: 1px solid rgba(255,255,255,0.06);
        font-size: 0.85rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        color: #ffffffcc;
      }

      .footer {
        margin-top: 2.2rem;
        font-size: 0.8rem;
        color: #6b7280;
        text-align: center;
      }

    </style>
  </head>
  <body>
    <div class="grid-bg"></div>

    <main class="card">
      <div class="badge">
        <span class="badge-dot"></span> Todo API · Backend Online
      </div>

      <h1>Focus on what powers your UI.</h1>

      <p class="subtitle">
        Este servidor Express alimenta tu dashboard de tareas en Next.js.  
        Usa esta API para crear, listar, actualizar y borrar todos.
      </p>

      <div class="pill-row">
        <span class="pill">GET /todos</span>
        <span class="pill">POST /todos</span>
        <span class="pill">PUT /todos/:id</span>
        <span class="pill">DELETE /todos/:id</span>
      </div>

      <section class="section">
        <div class="section-title">Endpoints disponibles</div>

        <div class="link-row">
          <div class="endpoint">
            <span>Listar tareas</span>
            <code>GET /todos</code>
          </div>

          <div class="endpoint">
            <span>Crear tarea</span>
            <code>POST /todos</code>
          </div>

          <div class="endpoint">
            <span>Actualizar tarea</span>
            <code>PUT /todos/:id</code>
          </div>

          <div class="endpoint">
            <span>Eliminar tarea</span>
            <code>DELETE /todos/:id</code>
          </div>
        </div>
      </section>

      <div class="footer">
        Backend · Express + TypeScript  
        · Listening on <code>http://localhost:4000</code>
      </div>
    </main>
  </body>
</html>`);
});
