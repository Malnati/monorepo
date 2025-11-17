#!/usr/bin/env bash
# app/db/validate-modular-schema.sh
# Script para validar schema modular contra banco real

set -euo pipefail

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*"; }

# Configurações
CONTAINER_NAME="test-modular-pg"
DB_NAME="test_modular"
DB_USER="postgres"
DB_PASS="postgres"
DB_PORT="5433"
TEST_DIR="/tmp/modular-migrations-test"

# Cleanup ao sair
cleanup() {
    log_info "Limpando recursos..."
    docker stop "$CONTAINER_NAME" 2>/dev/null || true
    docker rm "$CONTAINER_NAME" 2>/dev/null || true
}

trap cleanup EXIT

# Iniciar container PostgreSQL com PostGIS
start_postgres() {
    log_info "Iniciando container PostgreSQL com PostGIS..."
    
    docker run -d \
        --name "$CONTAINER_NAME" \
        -e POSTGRES_DB="$DB_NAME" \
        -e POSTGRES_USER="$DB_USER" \
        -e POSTGRES_PASSWORD="$DB_PASS" \
        -p "$DB_PORT:5432" \
        postgis/postgis:16-3.4-alpine \
        > /dev/null
    
    log_info "Aguardando PostgreSQL iniciar..."
    for i in {1..30}; do
        if docker exec "$CONTAINER_NAME" pg_isready -U "$DB_USER" > /dev/null 2>&1; then
            log_info "PostgreSQL pronto!"
            return 0
        fi
        sleep 1
    done
    
    log_error "Timeout aguardando PostgreSQL"
    return 1
}

# Executar migrations modulares
run_modular_migrations() {
    log_info "Executando migrations modulares..."
    
    local consolidated="$TEST_DIR/consolidated_migrations.sql"
    
    if [[ ! -f "$consolidated" ]]; then
        log_error "Arquivo consolidado não encontrado: $consolidated"
        log_info "Execute primeiro: ./test-modular-migrations.sh"
        return 1
    fi
    
    # Copiar imagens para o container
    log_info "Copiando imagens para container..."
    docker exec "$CONTAINER_NAME" mkdir -p /opt/dominio/seeds/img
    docker cp init/seeds/img/. "$CONTAINER_NAME:/opt/dominio/seeds/img/"
    
    # Executar migrations
    log_info "Executando SQL..."
    docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" < "$consolidated"
    
    log_info "Migrations executadas com sucesso!"
}

# Validar schema
validate_schema() {
    log_info "Validando schema criado..."
    
    # Listar tabelas
    log_info "Tabelas criadas:"
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "\dt" | grep "tb_" || true
    
    # Contar registros
    log_info ""
    log_info "Contagem de registros:"
    
    for table in tb_tipo tb_unidade tb_fornecedor tb_comprador tb_offer tb_fotos tb_transacao; do
        count=$(docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM $table;")
        log_info "  → $table: $count registros"
    done
    
    # Verificar tb_offer
    log_info ""
    log_info "Estrutura de tb_offer:"
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "\d tb_offer" | head -30
    
    # Dump schema
    log_info ""
    log_info "Gerando dump do schema..."
    docker exec "$CONTAINER_NAME" pg_dump -s -U "$DB_USER" "$DB_NAME" > "$TEST_DIR/schema_modular.sql"
    log_info "Schema salvo em: $TEST_DIR/schema_modular.sql"
}

# Main
main() {
    log_info "=== Validação de Schema Modular ==="
    log_info ""
    
    # Verificar prerequisitos
    if [[ ! -d "init/migrations/modular/ddl" ]]; then
        log_error "Execute este script do diretório app/db"
        log_error "Estrutura modular não encontrada em init/migrations/modular/"
        exit 1
    fi
    
    # Criar arquivo consolidado se não existir
    if [[ ! -f "$TEST_DIR/consolidated_migrations.sql" ]]; then
        log_info "Gerando arquivo consolidado..."
        bash test-modular-migrations.sh > /dev/null
    fi
    
    # Executar testes
    start_postgres
    run_modular_migrations
    validate_schema
    
    log_info ""
    log_info "=== Validação Concluída ==="
    log_info "Schema modular validado com sucesso!"
    log_info ""
    log_info "Arquivos gerados:"
    log_info "  - Consolidated SQL: $TEST_DIR/consolidated_migrations.sql"
    log_info "  - Schema dump: $TEST_DIR/schema_modular.sql"
}

main
