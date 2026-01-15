// src/routes/root.routes.ts
import { Router, type Request, type Response } from "express";
import { auth } from "../middleware/auth";

export const rootRouter = Router();

const startedAt = Date.now();

function baseUrl(req: Request) {
  // Cloud Run / reverse proxy friendly
  const proto =
    (req.headers["x-forwarded-proto"] as string | undefined) ?? req.protocol;
  const host = req.get("x-forwarded-host") ?? req.get("host") ?? "localhost";
  return `${proto}://${host}`;
}

rootRouter.get("/protected", auth, (req: Request, res: Response) => {
  res.json({ ok: true });
});

rootRouter.get("/", (req: Request, res: Response) => {
  const url = baseUrl(req);
  const now = new Date().toISOString();
  const uptimeSec = Math.floor((Date.now() - startedAt) / 1000);

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
        max-width: 920px;
        width: 100%;
        border-radius: 1.5rem;
        background: rgba(5, 5, 5, 1);
        padding: 2.4rem 2rem 2rem;
        box-shadow:
          0 0px 40px rgba(255, 255, 255, 0.2),
          0 0 0 1px rgba(255, 255, 255, 0);
        border: 1px solid rgba(255,255,255,0.06);
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
        font-size: clamp(2.4rem, 4vw, 3.2rem);
        font-weight: 800;
        letter-spacing: -0.05em;
        background: linear-gradient(to bottom, #ffffffff, #b5b5b5ff);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }

      p.subtitle {
        margin-top: 0.5rem;
        max-width: 44rem;
        font-size: 1rem;
        color: #9ca3af;
        line-height: 1.6;
      }

      .section {
        margin-top: 1.6rem;
        background: #0d0d0d;
        border-radius: 1.25rem;
        border: 1px solid rgba(255,255,255,0.05);
        padding: 1.4rem 1.25rem;
        box-shadow: 0 0px 20px rgba(10, 10, 12, 0.4);
      }

      .section-title {
        font-size: 0.8rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #9ca3af;
        margin-bottom: 0.8rem;
      }

      .row {
        display: grid;
        grid-template-columns: 180px 1fr;
        gap: 0.65rem 1rem;
        align-items: start;
        padding: 0.6rem 0;
        border-top: 1px solid rgba(255,255,255,0.06);
      }
      .row:first-of-type { border-top: 0; padding-top: 0; }
      .k { color: #cbd5e1; font-size: 0.9rem; }
      .v { color: #9ca3af; font-size: 0.9rem; overflow-wrap: anywhere; }

      code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        color: #ffffffcc;
      }

      .endpoint {
        padding: 0.65rem 0.9rem;
        border-radius: 0.6rem;
        background: #111;
        border: 1px solid rgba(255,255,255,0.06);
        font-size: 0.9rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.75rem;
        margin-top: 0.6rem;
      }

      .muted {
        color: #6b7280;
        font-size: 0.85rem;
        line-height: 1.5;
      }

      .footer {
        margin-top: 1.8rem;
        font-size: 0.8rem;
        color: #6b7280;
        text-align: center;
      }

      @media (max-width: 640px) {
        .row { grid-template-columns: 1fr; }
      }
    </style>
  </head>
  <body>
    <div class="grid-bg"></div>

    <main class="card">
      <div class="badge">
        <span class="badge-dot"></span> Todo API · Backend Online
      </div>

      <h1>StaiFocus API is running.</h1>

      <p class="subtitle">
        Esta API está desplegada y lista. La mayoría de endpoints requieren autenticación (JWT).
        Usa <code>/auth</code> para obtener un token y luego envía <code>Authorization: Bearer &lt;token&gt;</code>.
      </p>

      <section class="section">
        <div class="section-title">Status</div>

        <div class="row">
          <div class="k">Base URL</div>
          <div class="v"><code>${url}</code></div>
        </div>

        <div class="row">
          <div class="k">Health</div>
          <div class="v"><code>GET ${url}/health</code></div>
        </div>

        <div class="row">
          <div class="k">Environment</div>
          <div class="v"><code>${process.env.NODE_ENV ?? "unknown"}</code></div>
        </div>

        <div class="row">
          <div class="k">Time</div>
          <div class="v"><code>${now}</code></div>
        </div>

        <div class="row">
          <div class="k">Uptime</div>
          <div class="v"><code>${uptimeSec}s</code></div>
        </div>
      </section>

      <section class="section">
        <div class="section-title">Quick auth checklist</div>

        <div class="endpoint">
          <span>Login</span>
          <code>POST /auth/login</code>
        </div>

        <div class="endpoint">
          <span>Register</span>
          <code>POST /auth/register</code>
        </div>

        <div class="endpoint">
          <span>Test token (protected)</span>
          <code>GET /protected</code>
        </div>

        <p class="muted" style="margin-top:0.9rem;">
          Header esperado: <code>Authorization: Bearer &lt;token&gt;</code><br/>
          Si falta token: 401. Si token inválido/expirado: 401/403.
        </p>
      </section>

      <section class="section">
        <div class="section-title">Todos (requiere auth)</div>

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
      </section>

      <div class="footer">
        Express + TypeScript · Serving from <code>${url}</code>
      </div>
    </main>
  </body>
</html>`);
});
