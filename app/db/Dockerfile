# syntax=docker/dockerfile:1.6
# app/db/ockerfile
FROM postgis/postgis:16-3.4-alpine

LABEL org.opencontainers.image.title="db" \
      org.opencontainers.image.description="Imagem de desenvolvimento do banco de dados PostGIS do Prototype" \
      org.opencontainers.image.source="https://github.com/milleniumbrasil/app" \
      org.opencontainers.image.licenses="MIT"

# Copiar entrypoint customizado e scripts de migração
COPY entrypoint.sh /usr/local/bin/db-entrypoint.sh
COPY init/migrations /opt/dominio/migrations
COPY init/seeds /opt/dominio/seeds
RUN chmod +x /usr/local/bin/db-entrypoint.sh

# Configuração de variáveis, volumes, healthcheck e comandos
# estão definidos no docker-compose.yml
ENTRYPOINT ["/usr/local/bin/db-entrypoint.sh"]
