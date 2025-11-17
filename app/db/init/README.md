<!-- app/db/init/README.md -->

# Estrutura de Inicialização do Banco de Dados

## Visão Geral

A estrutura de inicialização do banco de dados está organizada em diretórios separados para melhor manutenibilidade:

```
init/
├── ddl/              ← Definições de estrutura (001-007)
├── seeds/            ← Dados de teste e imagens
│   ├── data/         ← Scripts de seed (008+)
│   └── img/          ← Arquivos de imagem
└── migrations/       ← Migrations legadas e adicionais
```

## Estrutura Modular (Nova)

### DDL - Definições de Estrutura (001-007)

Arquivos em `ddl/` criam a estrutura base do banco:

- `001_ddl_tb_tipo.sql` - Tipos de resíduo
- `002_ddl_tb_unidade.sql` - Unidades de medida
- `003_ddl_tb_fornecedor.sql` - Fornecedores
- `004_ddl_tb_comprador.sql` - Compradores
- `005_ddl_tb_offer.sql` - **Offers (tb_offer nativa)**
- `006_ddl_tb_fotos.sql` - Fotos dos offers
- `007_ddl_tb_transacao.sql` - Transações

**Importante:** A tabela `tb_offer` é criada diretamente com todos os campos necessários:
- `title`, `description`, `location`, `neighborhood`, `address` (desde o início)
- Não há mais renomeação de `tb_lote_residuo` → `tb_offer`

### Seeds - Dados de Teste (008+)

Arquivos em `seeds/data/` populam o banco com dados:

- `008_seed_fornecedores_compradores.sql` - Fornecedores e compradores com avatares
- `009_seed_offers.sql` - Offers básicos com fotos

### Migrations Adicionais (010+)

Migrations incrementais para:
- Campos geoespaciais (PostGIS)
- Índices e constraints
- Views e procedures
- Tabelas adicionais (users, payment_methods, etc.)

## Estrutura Legada (Atual em Produção)

A pasta `migrations/` contém a estrutura monolítica atual que ainda está ativa:

- `001_create_schema.sql` - Cria todas as tabelas base
- `002-027_*.sql` - Migrations incrementais
- `025_rename_tb_lote_residuo_to_tb_offer.sql` - Renomeia para tb_offer
- Seeds misturados com DDL

**Status:** ⚠️ Estrutura legada mantida para compatibilidade

## Transição para Estrutura Modular

### Fase Atual: Preparação ✅

- [x] Criar estrutura de diretórios (`ddl/`, `seeds/data/`)
- [x] Implementar DDL modular (001-007)
- [x] Criar tb_offer nativamente (sem ALTER TABLE)
- [x] Separar seeds de DDL
- [x] Documentar nova estrutura

### Próximos Passos

- [ ] Criar script de orquestração para execução ordenada
- [ ] Testar em ambiente limpo
- [ ] Validar schema final com pg_dump diff
- [ ] Migrar migrations adicionais (002-027 → 010+)
- [ ] Deprecar estrutura legada

## Como Usar a Estrutura Modular

### Desenvolvimento Local

Para testar a nova estrutura modular:

```bash
# 1. Criar concatenação ordenada
cat init/ddl/*.sql init/seeds/data/*.sql > /tmp/modular_init.sql

# 2. Executar em banco limpo
psql -U postgres -d db -f /tmp/modular_init.sql

# 3. Validar schema
pg_dump -s -U postgres db > /tmp/schema_modular.sql
```

### Validação

Comparar schema resultante com o atual:

```bash
# Schema atual (legado)
docker-compose exec db pg_dump -s -U postgres db > /tmp/schema_current.sql

# Schema modular (novo)
# (Após executar DDL + Seeds modulares)
pg_dump -s -U postgres db > /tmp/schema_modular.sql

# Diff
diff /tmp/schema_current.sql /tmp/schema_modular.sql
```

## Referências

- Plano de migração: `docs/rup/99-anexos/MVP/plan-unify-migrations.md`
- Auditoria: `docs/rup/99-anexos/MVP/audit-lote-residuo-references.md`
- DDL: `ddl/README.md`
- Seeds: `seeds/data/README.md`
