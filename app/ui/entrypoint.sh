#!/usr/bin/env bash
# app/ui/entrypoint.sh
set -euo pipefail

log() {
  printf '[ui-entrypoint] %s\n' "$*"
}

log "Iniciando interface React"

# Executar preview do Vite
log "Iniciando servidor de preview"
exec npm run preview -- --host 0.0.0.0 --port 80
