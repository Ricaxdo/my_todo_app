import cors from "cors";
import express, { type Request, type Response } from "express";

interface TaskParams {
  id: string;
}

const app = express();
const port = 4000; // Usamos 3001 para no chocar con el frontend (3000)

// Middleware
app.use(cors()); // Permite que el frontend se conecte
app.use(express.json()); // Permite leer JSON en el body de las peticiones

interface Task {
  id: number;
  text: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  category: string;
  createdAt: string; // ISO string
}

let tasks: Task[] = [
  {
    id: 1,
    text: "Primera tarea del backend",
    completed: false,
    priority: "medium",
    category: "General",
    createdAt: new Date().toISOString(),
  },
];

let nextId = 2;

app.get("/", (req: Request, res: Response) => {
  res.send(`
    <html>
      <head><title>API ToDo</title></head>
      <body style="font-family: system-ui; padding: 2rem;">
        <h1>API ToDo ✅</h1>
        <p>Backend corriendo correctamente.</p>
        <p>Prueba <code>/todos</code> para ver las tareas.</p>
      </body>
    </html>
  `);
});

// 1. Obtener todas las tareas
app.get("/todos", (req: Request, res: Response) => {
  res.json(tasks);
});

// 2. Crear una tarea
app.post("/todos", (req: Request, res: Response) => {
  const { text, priority, category } = req.body;
  if (!text) {
    return res.status(400).json({ error: "El texto es requerido" });
  }

  const newTask: Task = {
    id: nextId++,
    text,
    completed: false,
    priority: priority || "medium",
    category: category || "General",
    createdAt: new Date().toISOString(),
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// 3. Actualizar tarea
app.put("/todos/:id", (req: Request<TaskParams>, res: Response) => {
  const id = Number.parseInt(req.params.id, 10);

  const taskIndex = tasks.findIndex((t) => t.id === id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: "Tarea no encontrada" });
  }

  tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
  res.json(tasks[taskIndex]);
});

// 4. Borrar tarea
app.delete("/todos/:id", (req: Request<TaskParams>, res: Response) => {
  const id = Number.parseInt(req.params.id, 10);
  tasks = tasks.filter((t) => t.id !== id);
  res.status(204).send();
});

// Middleware 404 - debe ir después de todas las rutas
app.use((req: Request, res: Response) => {
  res.status(404).send(`
    <html>
      <head><title>404 - Not Found</title></head>
      <body style="font-family: system-ui; padding: 2rem; background:#020617; color:#e5e7eb;">
        <h1 style="font-size:2.5rem; margin-bottom:0.5rem;">404</h1>
        <p style="margin-bottom:1rem;">La ruta <code>${req.path}</code> no existe en esta API.</p>
        <p>Revisa la documentación o usa <code>/todos</code>.</p>
      </body>
    </html>
  `);
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`[backend] Servidor corriendo en http://localhost:${port}`);
});
