#!/usr/bin/env bash
# app/db/est-modular-migrations.sh
# Script para testar a estrutura modular de migrations

set -euo pipefail

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $*"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $*"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*"
}

# Verificar se estamos no diretório correto
if [[ ! -d "init/ddl" ]] || [[ ! -d "init/seeds/data" ]]; then
    log_error "Este script deve ser executado do diretório app/db"
    log_error "Estrutura modular não encontrada em init/ddl/ ou init/seeds/data/"
    exit 1
fi

# Criar diretório temporário para testes
TEST_DIR="/tmp/modular-migrations-test"
mkdir -p "$TEST_DIR"

log_info "Diretório de teste: $TEST_DIR"

# Função para concatenar migrations em ordem
concatenate_migrations() {
    local output_file="$1"
    
    log_info "Concatenando migrations modulares..."
    
    # Limpar arquivo de saída
    > "$output_file"
    
    # Adicionar header
    cat >> "$output_file" << 'EOF'
-- ====================================================================
-- MIGRATIONS MODULARES - Estrutura Consolidada
-- Gerado automaticamente por test-modular-migrations.sh
-- ====================================================================

EOF
    
    # Concatenar DDL files (001-007)
    log_info "Adicionando DDL files (001-007)..."
    for ddl_file in init/ddl/0*.sql; do
        if [[ -f "$ddl_file" ]]; then
            log_info "  → $(basename "$ddl_file")"
            echo "" >> "$output_file"
            echo "-- ===== $(basename "$ddl_file") =====" >> "$output_file"
            cat "$ddl_file" >> "$output_file"
        fi
    done
    
    # Concatenar Seed files (008+)
    log_info "Adicionando Seed files (008+)..."
    for seed_file in init/seeds/data/0*.sql; do
        if [[ -f "$seed_file" ]]; then
            log_info "  → $(basename "$seed_file")"
            echo "" >> "$output_file"
            echo "-- ===== $(basename "$seed_file") =====" >> "$output_file"
            cat "$seed_file" >> "$output_file"
        fi
    done
    
    log_info "Concatenação completa: $output_file"
}

# Função para validar SQL sintaxe
validate_sql_syntax() {
    local sql_file="$1"
    
    log_info "Validando sintaxe SQL..."
    
    # Verificar se PostgreSQL está instalado
    if ! command -v psql &> /dev/null; then
        log_warn "psql não encontrado, pulando validação de sintaxe"
        return 0
    fi
    
    # Validar sintaxe (dry-run)
    # Nota: Requer PostgreSQL instalado localmente
    log_info "Validação de sintaxe não implementada (requer conexão com banco)"
    
    return 0
}

# Função para contar objetos criados
count_objects() {
    local sql_file="$1"
    
    log_info "Contando objetos SQL..."
    
    local tables=$(grep -c "CREATE TABLE" "$sql_file" || true)
    local comments=$(grep -c "COMMENT ON" "$sql_file" || true)
    local inserts=$(grep -c "INSERT INTO" "$sql_file" || true)
    
    log_info "  → Tabelas: $tables"
    log_info "  → Comentários: $comments"
    log_info "  → Inserts: $inserts"
}

# Função principal de teste
main() {
    log_info "=== Teste de Migrations Modulares ==="
    log_info ""
    
    # Concatenar migrations
    CONSOLIDATED_FILE="$TEST_DIR/consolidated_migrations.sql"
    concatenate_migrations "$CONSOLIDATED_FILE"
    
    log_info ""
    
    # Validar sintaxe
    validate_sql_syntax "$CONSOLIDATED_FILE"
    
    log_info ""
    
    # Contar objetos
    count_objects "$CONSOLIDATED_FILE"
    
    log_info ""
    log_info "=== Teste Concluído ==="
    log_info "Arquivo consolidado disponível em: $CONSOLIDATED_FILE"
    log_info ""
    log_info "Para testar em banco real:"
    log_info "  1. Crie um banco limpo: createdb test_modular"
    log_info "  2. Execute: psql test_modular < $CONSOLIDATED_FILE"
    log_info "  3. Valide schema: pg_dump -s test_modular > /tmp/schema_modular.sql"
}

# Executar
main
