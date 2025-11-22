# app/oauth2/Dockerfile
FROM quay.io/oauth2-proxy/oauth2-proxy:latest

LABEL org.opencontainers.image.title="oauth2-proxy" \
      org.opencontainers.image.description="OAuth2 Proxy para autenticação Google" \
      org.opencontainers.image.source="https://github.com/milleniumbrasil/app" \
      org.opencontainers.image.licenses="MIT"

# O oauth2-proxy usa a porta 4180 por padrão
EXPOSE 4180

# O oauth2-proxy suporta variáveis de ambiente diretamente
# Não precisamos de entrypoint customizado, apenas configurar via docker-compose.yml
