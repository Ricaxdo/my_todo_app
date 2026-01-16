# StaiFocus · Fullstack Todo Application

StaiFocus es una aplicación fullstack de gestión de tareas orientada a productividad personal y trabajo organizado por espacios de trabajo.

El proyecto está construido con una arquitectura moderna basada en Next.js en el frontend y una API REST en Express + TypeScript en el backend, con autenticación mediante JWT y despliegue en infraestructura cloud.

## Live Demo

Frontend (Next.js):  
https://my-todo-app-rho-olive.vercel.app

Backend API (Cloud Run):  
https://todo-backend-lm5tuwlpya-uc.a.run.app

> El frontend está desplegado en Vercel y consume una API REST desplegada en Google Cloud Run.

## Arquitectura General

El proyecto sigue una arquitectura fullstack desacoplada, donde el frontend y el backend se desarrollan y despliegan de forma independiente.

- El **frontend** es una aplicación Next.js que gestiona la interfaz de usuario, la navegación y el estado de sesión.
- El **backend** es una API REST construida con Express y TypeScript, responsable de la autenticación, la lógica de negocio y el acceso a datos.
- La comunicación entre ambos se realiza mediante HTTP utilizando JSON y autenticación basada en JWT.

## Stack Tecnológico

### Frontend
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend
- Node.js
- Express
- TypeScript
- Mongoose
- celebrate/Joi (validación de requests)
- JWT (autenticación)
- bcrypt
- CORS

### Base de datos
- MongoDB Atlas (Mongoose)

### Infraestructura / Deploy
- Vercel (frontend)
- Google Cloud Run + Docker (backend)

## Funcionalidades Principales

- Autenticación de usuarios mediante JWT.
- Gestión de sesiones en el frontend con protección de rutas públicas y privadas.
- Creación, listado, actualización y eliminación de tareas.
- Organización de tareas por espacios de trabajo (workspaces).
- Asociación de tareas a un usuario autenticado.
- Interfaz responsive con estados de carga y feedback visual.
- Consumo de la API REST desde el frontend mediante fetch.

La aplicación está diseñada con una arquitectura modular que permite escalar funcionalidades como colaboración entre usuarios, roles o métricas avanzadas.

## Autenticación y seguridad

La autenticación se implementa mediante JSON Web Tokens (JWT). El backend expone endpoints públicos para registro e inicio de sesión y protege el resto de rutas mediante un middleware de autenticación.

- Las credenciales se almacenan de forma segura usando hash con bcrypt.
- Al iniciar sesión, el backend emite un JWT que el frontend envía en cada request como:
  `Authorization: Bearer <token>`.
- Las rutas privadas requieren token válido; en caso contrario responden con códigos 401/403.
- CORS está configurado para permitir únicamente orígenes autorizados en producción.

### Health
- `GET /health`  
  Retorna el estado del servicio.

### Auth
- `POST /auth/register`  
  Crea una cuenta de usuario.
- `POST /auth/login`  
  Autentica al usuario y retorna un JWT.

### Users (requiere JWT)
- `GET /users/me`  
  Retorna información del usuario autenticado.

### Workspaces (requiere JWT)
- `GET /workspaces`  
  Lista workspaces accesibles por el usuario.
- `POST /workspaces`  
  Crea un workspace.
- `GET /workspaces/:workspaceId`  
  Retorna detalle de un workspace.
- `PATCH /workspaces/:workspaceId`  
  Actualiza metadata del workspace.
- `POST /workspaces/join`  
  Unirse a un workspace mediante código/invitación (si aplica).

### Members (requiere JWT)
- `GET /workspaces/:workspaceId/members`  
  Lista miembros de un workspace.
- `POST /workspaces/:workspaceId/members`  
  Agrega un miembro (si aplica).

### Tasks / Todos (requiere JWT)
- `GET /todos`  
  Lista tareas.
- `POST /todos`  
  Crea una tarea.
- `PUT /todos/:id`  
  Actualiza una tarea.
- `DELETE /todos/:id`  
  Elimina una tarea.

### Workspace Todos (requiere JWT)
- `GET /workspaces/:workspaceId/todos`  
  Lista tareas por workspace.
- `POST /workspaces/:workspaceId/todos`  
  Crea tarea en un workspace.

### Activities (requiere JWT)
- `GET /workspaces/:workspaceId/activities`  
  Lista actividad del workspace (auditoría / timeline).

## Instalación y ejecución local

### Requisitos
- Node.js 20+
- Una instancia de MongoDB (recomendado: MongoDB Atlas)

### 1) Clonar el repositorio
```bash
git clone <REPO_URL>
cd <REPO_FOLDER>
````
### 2) Backend (Express + TypeScript)
```bash
cd backend
npm install

npm run dev
````
### 3) Frontend (Next.js)
```bash
cd frontend
npm install

npm run dev
````

Antes de ejecutar el backend, crear un archivo `.env` con las variables necesarias (ver sección "Variables de entorno").

## Variables de entorno (desarrollo local)

### Backend (`backend/.env`)
```env
# Entorno
NODE_ENV=development
PORT=4000

# Base de datos
MONGO_URI=mongodb+srv://<USER>:<PASSWORD>@<CLUSTER>/<DB_NAME>

# Autenticación
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1d

# Seguridad
BCRYPT_SALT_ROUNDS=10

# CORS
CORS_ORIGIN=http://localhost:3000
````
### Backend (`frontend/.env`)
````
NEXT_PUBLIC_API_URL=http://localhost:4000
````
