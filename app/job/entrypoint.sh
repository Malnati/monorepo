#!/bin/sh
# app/job/entrypoint.sh

set -e

echo "Starting job..."
echo "Environment: ${NODE_ENV:-development}"
echo "Inbox directory: ${APP_JOB_INBOX:-/var/data/inbox}"
echo "Poll interval: ${APP_JOB_POLL_INTERVAL:-60000}ms"

# Verificar variáveis obrigatórias
if [ -z "$APP_API_TOKEN" ]; then
  echo "ERROR: APP_API_TOKEN is not set"
  exit 1
fi

if [ -z "$APP_API_BASE_URL" ]; then
  echo "ERROR: APP_API_BASE_URL is not set"
  exit 1
fi

# Garantir que os diretórios existem
mkdir -p "${APP_JOB_INBOX:-/var/data/inbox}"
mkdir -p "${APP_JOB_PROCESSED:-/var/data/processed}"
mkdir -p "${APP_JOB_FAILED:-/var/data/failed}"

echo "Directories ready"
echo "Starting application..."

exec "$@"
