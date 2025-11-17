# app/api/Dockerfile
FROM node:20-alpine AS builder

LABEL org.opencontainers.image.title="api" \
      org.opencontainers.image.description="API NestJS para protótipo MVP de marketplace de resíduos" \
      org.opencontainers.image.source="https://github.com/milleniumbrasil/app" \
      org.opencontainers.image.licenses="MIT"

WORKDIR /app

# Configurar npm para aumentar timeout e retries
RUN npm config set fetch-timeout 60000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Instalar todas as dependências (incluindo devDependencies) para o build
COPY package*.json ./
# Usar npm ci se package-lock.json existir, caso contrário usar npm install
# Retry automático em caso de falha de rede
RUN if [ -f package-lock.json ]; then \
      npm ci || (sleep 5 && npm ci) || (sleep 10 && npm ci); \
    else \
      npm install || (sleep 5 && npm install) || (sleep 10 && npm install); \
    fi && npm cache clean --force

# Copiar código fonte
COPY . .

# Build da aplicação (compila src/ e scripts/)
RUN npm run build && \
    # Compilar scripts separadamente se necessário
    (npx tsc scripts/test-startup.ts --outDir dist/scripts --module commonjs --target ES2021 --esModuleInterop --skipLibCheck --resolveJsonModule 2>/dev/null || true)

# Stage de runtime - apenas dependências de produção
FROM node:20-alpine AS runtime

WORKDIR /app

# Instalar curl para healthcheck, postgresql-client para validação de schema e bash para entrypoint.sh
# Alpine 3.22 requer postgresql16-client (nome versionado) e libpq
# Usando --update para atualizar índices inline sem apk update separado
RUN apk add --update --no-cache \
        curl \
        postgresql16-client \
        netcat-openbsd \
        bash \
        libpq \
    || (sleep 5 && apk add --update --no-cache \
        curl \
        postgresql16-client \
        netcat-openbsd \
        bash \
        libpq \
    )

# Configurar npm para aumentar timeout e retries no stage de runtime
RUN npm config set fetch-timeout 60000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Copiar apenas package.json e package-lock.json para instalar dependências de produção
COPY package*.json ./
# Instalar apenas dependências de produção
# Retry automático em caso de falha de rede
RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev || (sleep 5 && npm ci --omit=dev) || (sleep 10 && npm ci --omit=dev); \
    else \
      npm install --omit=dev || (sleep 5 && npm install --omit=dev) || (sleep 10 && npm install --omit=dev); \
    fi && npm cache clean --force

# Copiar o build do stage anterior
COPY --from=builder /app/dist ./dist

# Copiar scripts de inicialização e validação
COPY entrypoint.sh /app/entrypoint.sh
COPY scripts/ /app/scripts/

# Tornar scripts executáveis (usando sh ao invés de bash para reduzir tamanho da imagem)
RUN chmod +x /app/entrypoint.sh && \
    ([ -d /app/scripts ] && chmod +x /app/scripts/*.sh 2>/dev/null || true)

# Configuração de variáveis, volumes, healthcheck e comandos
# estão definidos no docker-compose.yml
ENTRYPOINT ["/app/entrypoint.sh"]
