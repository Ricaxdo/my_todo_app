# Imagen oficial de Node
FROM node:20-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos package files primero (mejor cache)
COPY package*.json ./

# Instalamos dependencias
RUN npm ci --omit=dev

# Copiamos el resto del código
COPY . .

# Compilamos TypeScript (si usas ts)
RUN npm run build

# Cloud Run expone este puerto (informativo)
EXPOSE 8080

# Arranque
CMD ["node", "dist/index.js"]
