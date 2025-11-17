# app/job/Dockerfile
FROM node:20-alpine AS builder

LABEL org.opencontainers.image.title="job" \
      org.opencontainers.image.description="Job processor NestJS para protótipo MVP de marketplace de resíduos" \
      org.opencontainers.image.source="https://github.com/milleniumbrasil/app" \
      org.opencontainers.image.licenses="MIT"

WORKDIR /app

# Configurar npm para aumentar timeout e retries
RUN npm config set fetch-timeout 60000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

COPY package*.json ./
# Usar npm ci se package-lock.json existir, caso contrário usar npm install
RUN if [ -f package-lock.json ]; then \
      npm ci || (sleep 5 && npm ci) || (sleep 10 && npm ci); \
    else \
      npm install || (sleep 5 && npm install) || (sleep 10 && npm install); \
    fi && npm cache clean --force

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh && \
    mkdir -p /var/data/inbox /var/data/processed /var/data/failed && \
    chown -R node:node /var/data

USER node

EXPOSE 3002

ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "dist/main"]
