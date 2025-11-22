#!/bin/sh
# app/api/entrypoint.sh
set -eu

log() {
  printf '[api-entrypoint] %s\n' "$*"
}

log "Iniciando API NestJS"

# Limpar variáveis de ambiente (remover espaços e quebras de linha)
export DATABASE_HOST="${DATABASE_HOST:-db}"
export DATABASE_HOST="${DATABASE_HOST// /}"
export DATABASE_HOST="${DATABASE_HOST//$'\n'/}"
export DATABASE_HOST="${DATABASE_HOST//$'\r'/}"
export DATABASE_PORT="${DATABASE_PORT:-5432}"
export DATABASE_PORT="${DATABASE_PORT// /}"
export DATABASE_USER="${DATABASE_USER:-postgres}"
export DATABASE_USER="${DATABASE_USER// /}"
export DATABASE_PASSWORD="${DATABASE_PASSWORD:-postgres}"
export DATABASE_PASSWORD="${DATABASE_PASSWORD// /}"
export DATABASE_NAME="${DATABASE_NAME:-db}"
export DATABASE_NAME="${DATABASE_NAME// /}"

# Aguardar banco de dados estar disponível
if [ -n "${DATABASE_HOST:-}" ]; then
  log "Aguardando conexão com banco de dados ${DATABASE_HOST}:${DATABASE_PORT}"
  until nc -z "${DATABASE_HOST}" "${DATABASE_PORT}" 2>/dev/null; do
    log "Aguardando banco de dados..."
    sleep 2
  done
  log "Banco de dados disponível"
fi

# Validar schema do banco de dados antes de iniciar
SCRIPT_PATH="/app/scripts/validate-schema.sh"
if [ -d "/app/scripts" ] && [ -f "${SCRIPT_PATH}" ]; then
  log "Executando validação de schema..."
  if ! sh "${SCRIPT_PATH}"; then
    log "ERRO CRÍTICO: Validação de schema falhou. Container não será iniciado."
    log "Verifique os logs acima para detalhes do erro."
    exit 1
  fi
  log "Validação de schema concluída com sucesso"
else
  log "AVISO: Script de validação não encontrado. Pulando validação."
fi

# Executar migrações se necessário (futuro)
# log "Executando migrações..."
# npm run migration:run || true

# Configurar variáveis de ambiente para testes
export HOST="${HOST:-0.0.0.0}"
export PORT="${PORT:-3001}"
export API_URL="${API_URL:-http://${HOST}:${PORT}/api}"

# Mockar serviços externos para testes (se não configurados)
export GOOGLE_MAPS_SERVER_KEY="${GOOGLE_MAPS_SERVER_KEY:-mock-key-for-tests}"
export OPENROUTER_API_KEY="${OPENROUTER_API_KEY:-mock-key-for-tests}"
export GMAIL_CLIENT_ID="${GMAIL_CLIENT_ID:-mock-client-id}"
export GMAIL_CLIENT_SECRET="${GMAIL_CLIENT_SECRET:-mock-client-secret}"

# Iniciar aplicação em background
log "Iniciando aplicação NestJS em background..."
# NestJS compila para dist/src/main.js quando sourceRoot é "src"
MAIN_FILE="dist/src/main.js"
if [ ! -f "${MAIN_FILE}" ]; then
  log "ERRO: Arquivo ${MAIN_FILE} não encontrado. Estrutura de dist/:"
  ls -la dist/ 2>/dev/null || echo "Diretório dist não existe"
  exit 1
fi
log "Usando arquivo principal: ${MAIN_FILE}"
node "${MAIN_FILE}" &
API_PID=$!

# Aguardar API estar disponível
log "Aguardando API estar disponível..."
MAX_WAIT=60
WAITED=0
while ! nc -z "${HOST}" "${PORT}" 2>/dev/null; do
  if [ $WAITED -ge $MAX_WAIT ]; then
    log "ERRO CRÍTICO: API não está disponível após ${MAX_WAIT} segundos"
    kill $API_PID 2>/dev/null || true
    exit 1
  fi
  sleep 2
  WAITED=$((WAITED + 2))
done

log "API está disponível, executando testes de inicialização..."

# Executar testes de inicialização
TEST_SCRIPT="/app/scripts/run-startup-tests.sh"
if [ -f "${TEST_SCRIPT}" ]; then
  chmod +x "${TEST_SCRIPT}"
  if ! sh "${TEST_SCRIPT}"; then
    log "ERRO CRÍTICO: Testes de inicialização falharam. Encerrando API."
    kill $API_PID 2>/dev/null || true
    exit 1
  fi
  log "✅ Testes de inicialização concluídos com sucesso"
else
  log "AVISO: Script de testes não encontrado. Pulando testes de inicialização."
fi

# Manter API rodando em foreground
log "API está pronta e rodando. PID: $API_PID"
wait $API_PID
