#!/usr/bin/env bash
# app/caddy/entrypoint.sh
set -euo pipefail

log() {
  printf '[caddy-entrypoint] %s\n' "$*"
}

log "Iniciando Caddy"

# Verificar se Caddyfile existe
if [ ! -f /etc/app/caddy/Caddyfile ]; then
  log "ERRO: Caddyfile não encontrado em /etc/app/caddy/Caddyfile"
  exit 1
fi

log "Caddyfile encontrado, iniciando Caddy"

# Executar Caddy
exec caddy run --config /etc/app/caddy/Caddyfile --adapter caddyfile

