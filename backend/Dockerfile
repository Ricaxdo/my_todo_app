# ---------- Build stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Instala deps (incluye dev deps para compilar TS)
COPY package*.json ./
RUN npm ci

# Copia el código y compila
COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Instala solo dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev

# Copia el build compilado
COPY --from=builder /app/dist ./dist

# (Opcional) Si tienes assets fuera de dist, copia lo necesario:
# COPY --from=builder /app/public ./public

# Cloud Run inyecta PORT; tu app ya usa env.port (process.env.PORT)
EXPOSE 4000

CMD ["node", "dist/index.js"]
