FROM node:22-alpine

WORKDIR /app

# Needed for some native deps occasionally used by Nuxt/Vite
RUN apk add --no-cache libc6-compat

# Install dependencies first for better layer caching
COPY package*.json ./

RUN npm ci

# Copy source
COPY . .

# Nuxt dev server
EXPOSE 3000

# Required so Nuxt listens outside container
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=development

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
