FROM node:22

WORKDIR /app

# Copiar archivos de dependencias primero (mejor uso del cache de capas)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Exponer el puerto de desarrollo de Nuxt
EXPOSE 3000

# Variables de entorno para desarrollo
ENV NODE_ENV=development
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# Comando de desarrollo con hot reload
CMD ["npm", "run", "dev"]
