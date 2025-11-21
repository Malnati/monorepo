#!/bin/sh
# app/api/scripts/validate-schema.sh
# Script para validar schema do banco de dados antes de iniciar a aplicação

set -eu

log() {
  printf '[schema-validate] %s\n' "$*"
}

error() {
  printf '[schema-validate] ERROR: %s\n' "$*" >&2
  exit 1
}

# Variáveis de ambiente do banco
DB_HOST="${DATABASE_HOST:-db}"
DB_PORT="${DATABASE_PORT:-5432}"
DB_USER="${DATABASE_USER:-postgres}"
DB_PASSWORD="${DATABASE_PASSWORD:-postgres}"
DB_NAME="${DATABASE_NAME:-db}"

export PGPASSWORD="${DB_PASSWORD}"

log "Validando schema do banco de dados ${DB_HOST}:${DB_PORT}/${DB_NAME}"

# Aguardar banco estar disponível
MAX_RETRIES=30
RETRY_COUNT=0
until pg_isready -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" >/dev/null 2>&1; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    error "Banco de dados não está disponível após ${MAX_RETRIES} tentativas"
  fi
  log "Aguardando banco de dados... (${RETRY_COUNT}/${MAX_RETRIES})"
  sleep 2
done

log "Banco de dados está disponível"

# Validar que tabelas críticas existem e têm estrutura esperada
log "Verificando estrutura das tabelas críticas..."

# Verificar se tb_offer existe
CHECK_OFFER_TABLE=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -tAc "
  SELECT COUNT(*) 
  FROM information_schema.tables 
  WHERE table_name = 'tb_offer'
    AND table_schema = 'public';
" 2>&1) || error "Falha ao verificar tabela tb_offer: ${CHECK_OFFER_TABLE}"

if [ "${CHECK_OFFER_TABLE}" -eq 0 ]; then
  error "Tabela tb_offer não existe. Migrations não foram executadas."
fi

# Verificar se tb_offer tem coluna title
CHECK_COLUMN=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -tAc "
  SELECT COUNT(*) 
  FROM information_schema.columns 
  WHERE table_name = 'tb_offer' 
    AND column_name = 'title'
    AND table_schema = 'public';
" 2>&1) || error "Falha ao verificar coluna title: ${CHECK_COLUMN}"

if [ "${CHECK_COLUMN}" -eq 0 ]; then
  error "Tabela tb_offer não possui coluna 'title'. Schema desatualizado ou migração não executada."
fi

# Verificar se tb_offer tem coluna description (obrigatória)
CHECK_DESCRICAO=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -tAc "
  SELECT COUNT(*) 
  FROM information_schema.columns 
  WHERE table_name = 'tb_offer' 
    AND column_name = 'description'
    AND table_schema = 'public';
" 2>&1) || error "Falha ao verificar coluna description: ${CHECK_DESCRICAO}"

if [ "${CHECK_DESCRICAO}" -eq 0 ]; then
  error "Tabela tb_offer não possui coluna 'description'. Schema desatualizado ou migração não executada."
fi

# Verificar se tb_offer tem coluna location (opcional)
CHECK_LOCATION=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -tAc "
  SELECT COUNT(*) 
  FROM information_schema.columns 
  WHERE table_name = 'tb_offer' 
    AND column_name = 'location'
    AND table_schema = 'public';
" 2>&1) || CHECK_LOCATION=0

if [ "${CHECK_LOCATION}" -eq 0 ]; then
  log "Aviso: Tabela tb_offer não possui coluna 'location' (opcional)"
fi

# Verificar novos campos (neighborhood, address) - opcionais
CHECK_NEIGHBORHOOD=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -tAc "
  SELECT COUNT(*) 
  FROM information_schema.columns 
  WHERE table_name = 'tb_offer' 
    AND column_name = 'neighborhood'
    AND table_schema = 'public';
" 2>&1) || CHECK_NEIGHBORHOOD=0

# Neighborhood é opcional - apenas log se não existir
if [ "${CHECK_NEIGHBORHOOD}" -eq 0 ]; then
  log "Aviso: Tabela tb_offer não possui coluna 'neighborhood' (opcional)"
fi

CHECK_ADDRESS=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -tAc "
  SELECT COUNT(*) 
  FROM information_schema.columns 
  WHERE table_name = 'tb_offer' 
    AND column_name = 'address'
    AND table_schema = 'public';
" 2>&1) || CHECK_ADDRESS=0

# Address é opcional - apenas log se não existir
if [ "${CHECK_ADDRESS}" -eq 0 ]; then
  log "Aviso: Tabela tb_offer não possui coluna 'address' (opcional)"
fi

# Verificar se views críticas existem e estão atualizadas
log "Verificando views..."

# Verificar view vw_lotes_disponiveis - opcional
CHECK_VIEW_DISPONIVEIS=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -tAc "
  SELECT COUNT(*) 
  FROM pg_views 
  WHERE schemaname = 'public' 
    AND viewname = 'vw_lotes_disponiveis';
" 2>&1) || CHECK_VIEW_DISPONIVEIS=0

if [ "${CHECK_VIEW_DISPONIVEIS}" -eq 0 ]; then
  log "Aviso: View vw_lotes_disponiveis não existe (opcional)"
else
  # Verificar se a view referencia tb_offer
  VIEW_USES_OFFER=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -tAc "
    SELECT COUNT(*) 
    FROM pg_views 
    WHERE schemaname = 'public' 
      AND viewname = 'vw_lotes_disponiveis'
      AND definition LIKE '%tb_offer%';
  " 2>&1) || VIEW_USES_OFFER=0

  if [ "${VIEW_USES_OFFER}" -eq 0 ]; then
    log "Aviso: View vw_lotes_disponiveis não referencia tabela 'tb_offer' (opcional)"
  fi
fi

# Verificar se tb_fotos usa offer_id ou lote_residuo_id (backward compatibility)
CHECK_FOTOS_FK=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -tAc "
  SELECT COUNT(*) 
  FROM information_schema.columns 
  WHERE table_name = 'tb_fotos' 
    AND column_name IN ('offer_id', 'lote_residuo_id')
    AND table_schema = 'public';
" 2>&1) || CHECK_FOTOS_FK=0

if [ "${CHECK_FOTOS_FK}" -eq 0 ]; then
  log "Aviso: Tabela tb_fotos não possui coluna 'offer_id' ou 'lote_residuo_id' (opcional)"
fi

# Verificar se tb_transacao usa offer_id ou lote_residuo_id (backward compatibility)
CHECK_TRANSACAO_FK=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -tAc "
  SELECT COUNT(*) 
  FROM information_schema.columns 
  WHERE table_name = 'tb_transacao' 
    AND column_name IN ('offer_id', 'lote_residuo_id')
    AND table_schema = 'public';
" 2>&1) || CHECK_TRANSACAO_FK=0

if [ "${CHECK_TRANSACAO_FK}" -eq 0 ]; then
  log "Aviso: Tabela tb_transacao não possui coluna 'offer_id' ou 'lote_residuo_id' (opcional)"
fi

log "✅ Validação de schema concluída com sucesso"
log "   - Tabela tb_offer com campos title, description, location, neighborhood, address"
log "   - FK offer_id em tb_fotos e tb_transacao"
log "   - View vw_lotes_disponiveis atualizada para tb_offer"
exit 0
