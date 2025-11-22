#!/bin/sh
# app/api/scripts/run-startup-tests.sh
# Script para executar testes de inicialização da API

set -eu

log() {
  printf '[startup-tests] %s\n' "$*"
}

error() {
  printf '[startup-tests] ERROR: %s\n' "$*" >&2
  exit 1
}

log "Iniciando testes de inicialização da API..."

# Variáveis de ambiente
API_URL="${API_URL}"
API_PORT="${PORT:-3001}"
API_HOST="${HOST:-0.0.0.0}"

if [ -z "${API_URL}" ]; then
  error "API_URL não está configurada. Configure no docker-compose.yml ou .env"
fi

# Aguardar API estar disponível (máximo 60 segundos)
log "Aguardando API estar disponível em ${API_URL}..."
MAX_WAIT=60
WAITED=0
while ! nc -z "${API_HOST}" "${API_PORT}" 2>/dev/null; do
  if [ $WAITED -ge $MAX_WAIT ]; then
    error "API não está disponível após ${MAX_WAIT} segundos"
  fi
  sleep 2
  WAITED=$((WAITED + 2))
done

log "API está disponível, executando testes..."

# Executar testes usando Node.js diretamente no código compilado
# O script será compilado junto com a aplicação
SCRIPT_PATH="/app/dist/scripts/test-startup.js"
if [ -f "${SCRIPT_PATH}" ]; then
  export API_URL="${API_URL}"
  export PORT="${PORT:-3001}"
  export HOST="${HOST:-0.0.0.0}"
  if ! node "${SCRIPT_PATH}"; then
    error "Testes de inicialização falharam. Verifique os logs acima."
  fi
  log "✅ Todos os testes de inicialização passaram!"
else
  error "Script de testes não encontrado em ${SCRIPT_PATH}"
  error "Arquivos em /app/dist/scripts/:"
  ls -la /app/dist/scripts/ 2>/dev/null || echo "Diretório não existe"
fi

exit 0
