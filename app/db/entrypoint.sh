#!/usr/bin/env bash
# app/db/entrypoint.sh
set -euo pipefail

log() {
  printf '[db-entrypoint] %s\n' "$*"
}

log "Preparando ambiente do Postgres"

# Listar scripts de inicialização disponíveis (apenas para log)
# O Postgres executa apenas arquivos (não diretórios) em /docker-entrypoint-initdb.d
if [ -d "/docker-entrypoint-initdb.d" ]; then
  shopt -s nullglob
  # Listar apenas arquivos, ignorando diretórios
  scripts=()
  for item in /docker-entrypoint-initdb.d/*; do
    if [ -f "$item" ]; then
      scripts+=("$item")
    fi
  done
  if [ ${#scripts[@]} -gt 0 ]; then
    log "Scripts de inicialização disponíveis:"
    for script in "${scripts[@]}"; do
      log "- $(basename "$script")"
    done
  else
    log "Nenhum script de inicialização encontrado"
  fi
  shopt -u nullglob
fi

# Passar controle para o entrypoint padrão do Postgres
# O Postgres executará automaticamente os scripts em /docker-entrypoint-initdb.d
# na primeira inicialização (quando /var/lib/postgresql/data está vazio)
exec /usr/local/bin/docker-entrypoint.sh "$@"
