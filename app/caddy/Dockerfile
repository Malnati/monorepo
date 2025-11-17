# app/caddy/Dockerfile
FROM caddy:2-alpine

LABEL org.opencontainers.image.title="caddy" \
      org.opencontainers.image.description="Proxy reverso Caddy com HTTPS automático para protótipo MVP" \
      org.opencontainers.image.source="https://github.com/milleniumbrasil/app" \
      org.opencontainers.image.licenses="MIT"

# Instalar dependências necessárias
RUN apk add --no-cache bash

# Copiar Caddyfile e entrypoint
COPY Caddyfile /etc/app/caddy/Caddyfile
COPY entrypoint.sh /entrypoint.sh

# Tornar entrypoint executável
RUN chmod +x /entrypoint.sh

# Configuração de variáveis, volumes, healthcheck e comandos
# estão definidos no docker-compose.yml
ENTRYPOINT ["/entrypoint.sh"]

