# Usar imagen estable de Node.js 22 en lugar de Bun
FROM node:22-alpine

WORKDIR /app

# Copiar configuración (incluyendo el package-lock.json que acabas de generar localmente)
COPY package*.json ./

# Instalar dependencias ignorando conflictos estrictos de pares
RUN npm install --legacy-peer-deps

# Copiar el resto del código
COPY . .

# Ejecutar el build de Vite y esbuild
RUN npm run build

# Exponer el puerto interno configurado
EXPOSE 3030

# Ejecutar el servidor compilado
CMD ["npm", "start"]