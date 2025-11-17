# app/ui/Dockerfile
FROM node:20-alpine AS base

LABEL org.opencontainers.image.title="ui" \
      org.opencontainers.image.description="Interface React para protótipo MVP de marketplace de resíduos" \
      org.opencontainers.image.source="https://github.com/milleniumbrasil/app" \
      org.opencontainers.image.licenses="MIT"

WORKDIR /app

# Argumentos de build para variáveis de ambiente do Vite
# Valores vêm do docker-compose.yml (que lê do .env)
# Não há valores padrão aqui - seguindo a cadeia: .env → docker-compose.yml → ARG
ARG VITE_GOOGLE_MAPS_API_KEY
ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_CLIENT_ID

# Instalar dependências
COPY app/ui/package*.json ./
# Usar npm ci se package-lock.json existir, caso contrário usar npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi && npm cache clean --force

# Copiar shared-constants primeiro (necessário para o build)
COPY shared-constants ./shared-constants

# Copiar código fonte do UI
COPY app/ui .

# Build da aplicação
# Variáveis VITE_* são necessárias em build-time (não runtime)
# O Vite substitui import.meta.env.VITE_* durante a compilação
RUN VITE_GOOGLE_MAPS_API_KEY="${VITE_GOOGLE_MAPS_API_KEY}" \
    VITE_API_BASE_URL="${VITE_API_BASE_URL}" \
    VITE_GOOGLE_CLIENT_ID="${VITE_GOOGLE_CLIENT_ID}" \
    npm run build

# Configuração de variáveis, volumes, healthcheck e comandos
# estão definidos no docker-compose.yml
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "80"]
