# app/caddy/README.md
# Configuração do Caddy Global para oauth2-proxy

Este diretório contém o template de configuração do Caddyfile para ser usado com o Caddy global da máquina.

## Como usar

1. Substitua as variáveis de ambiente no `Caddyfile.template`:
   - `${APP_CADDY_EMAIL}` → email para Let's Encrypt (ex: `admin@cranio.dev`)
   - `${APP_CADDY_HTTP_PORT}` → porta HTTP (ex: `80`)
   - `${APP_CADDY_DOMAIN}` → domínio (ex: `monorepo.cranio.dev`)

2. Copie o arquivo processado para o diretório de configuração do Caddy global:
   ```bash
   # Exemplo: copiar para /etc/caddy/Caddyfile
   sudo cp Caddyfile.template /etc/caddy/Caddyfile
   ```

3. Recarregue o Caddy:
   ```bash
   sudo caddy reload --config /etc/caddy/Caddyfile
   ```

## Configuração

O Caddyfile configura:
- Proxy reverso para `localhost:5180` (porta mapeada do container oauth2-proxy)
- Headers necessários (X-Forwarded-Proto, X-Forwarded-Host, X-Forwarded-For, X-Real-IP)
- Health check endpoint em `/ping`
- HTTPS automático via Let's Encrypt

## Variáveis de ambiente

Antes de usar o template, substitua as seguintes variáveis:
- `${APP_CADDY_EMAIL}` → Email para Let's Encrypt (ex: `admin@cranio.dev`)
- `${APP_CADDY_HTTP_PORT}` → Porta HTTP (ex: `80`)
- `${APP_CADDY_DOMAIN}` → Domínio (ex: `monorepo.cranio.dev`)
- `${APP_OAUTH2_PROXY_PORT}` → Porta do oauth2-proxy no host (ex: `5180`)

## Nota

O oauth2-proxy está rodando em um container Docker e a porta 4180 está mapeada para `5180` no host.
O Caddy global acessa o oauth2-proxy via `localhost:5180`.
