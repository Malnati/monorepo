<!-- app/db/init/migrations/modular/README.md -->

# Estrutura Modular de Migrations

## Contexto

Este diretório contém a **versão modularizada** das migrations, conforme especificado em `docs/rup/99-anexos/MVP/plan-unify-migrations.md`.

A estrutura atual (`../001_create_schema.sql` + migrations 002-027) será **gradualmente substituída** por arquivos modulares organizados por tabela.

## Estrutura Modular

### DDL por Tabela (ddl/000-007)

Todos os arquivos DDL foram movidos para o subdiretório `ddl/`:

- `ddl/000_extensions.sql` - Extensões PostgreSQL (PostGIS)
- `ddl/001_ddl_tb_tipo.sql` - Tipos de resíduo
- `ddl/002_ddl_tb_unidade.sql` - Unidades de medida
- `ddl/003_ddl_tb_fornecedor.sql` - Fornecedores
- `ddl/004_ddl_tb_comprador.sql` - Compradores
- `ddl/005_ddl_tb_offer.sql` - **Offers (criada nativamente com todos os campos)**
- `ddl/006_ddl_tb_fotos.sql` - Fotos dos offers (FK para tb_offer)
- `ddl/007_ddl_tb_transacao.sql` - Transações (FK para tb_offer)

### Seeds por Tabela (seeds/008-014)

Todos os seeds foram separados e movidos para o subdiretório `seeds/`:

- `seeds/008_seed_tb_tipo.sql` - Tipos padrão de resíduos
- `seeds/009_seed_tb_unidade.sql` - Unidades de medida padrão
- `seeds/010_seed_tb_fornecedor.sql` - Fornecedor padrão
- `seeds/011_seed_tb_comprador.sql` - Comprador padrão
- `seeds/012_seed_tb_offer.sql` - Offers de teste com dados completos
- `seeds/013_seed_tb_fotos.sql` - Fotos dos offers de teste
- `seeds/014_seed_tb_transacao.sql` - Transações de teste

### Migrations Existentes (015+)

As migrations atuais `002_add_geospatial_fields.sql` até `027_update_view_available_lots_for_offer.sql` serão **renumeradas** para `015-040` na transição (se necessário).

## Plano de Transição

### Fase 1: Preparação ✅ COMPLETA
- ✅ Criar estrutura modular em `modular/`
- ✅ Separar DDL e seeds em diretórios distintos (ddl/ e seeds/)
- ✅ Renomear 005_ddl_tb_lote_residuo.sql → 005_ddl_tb_offer.sql
- ✅ Criar tb_offer nativamente com todos os campos
- ✅ Incluir title, description, location, neighborhood, address desde CREATE TABLE
- ✅ Eliminar ALTER TABLE da estrutura modular
- ✅ Criar arquivos seed separados (008-014)
- ✅ Atualizar FKs em tb_fotos e tb_transacao para referenciar tb_offer

### Fase 2: Validação ✅ COMPLETA
- ✅ Criar ambiente de teste limpo (Docker PostgreSQL + PostGIS)
- ✅ Executar migrations modulares (000-014: extensions + DDL + seeds)
- ✅ Validar schema resultante (7 tabelas, 19 registros)
- ✅ Executar pg_dump e gerar schema_modular.sql

### Fase 3: Substituição
- [ ] Deprecar `001_create_schema.sql`
- [ ] Mover arquivos de `modular/` para `../`
- [ ] Renumerar migrations existentes (se necessário)
- [ ] Atualizar documentação

## Status Atual

✅ **FASE 1B COMPLETA** - Estrutura modular totalmente implementada com:
- DDL nativo de tb_offer com todos os campos geoespaciais
- Separação completa entre DDL (ddl/) e seeds (seeds/)
- Seeds modulares para cada tabela
- Referências atualizadas para tb_offer em fotos e transações

✅ **FASE 2 COMPLETA** - Validação em ambiente isolado:
- Ambiente de teste PostgreSQL + PostGIS validado
- Schema modular executado com sucesso (8 DDL + 7 seeds)
- Todas as tabelas criadas corretamente (tb_tipo, tb_unidade, tb_fornecedor, tb_comprador, tb_offer, tb_fotos, tb_transacao)
- Dados de teste carregados: 6 tipos, 5 unidades, 1 fornecedor, 1 comprador, 5 offers, 5 fotos, 2 transações
- pg_dump gerado e validado em `/tmp/modular-migrations-test/schema_modular.sql`

⚠️ **PRONTO PARA FASE 3** - As migrations ativas continuam sendo `001_create_schema.sql` + `002-027`. A estrutura modular foi validada e está pronta para substituição planejada.

## Diferenças Principais

### tb_offer Nativa vs. Renomeação

A estrutura modular cria `tb_offer` **nativamente** com todos os campos desde o início:
- ✅ `title`, `description`, `location`, `neighborhood`, `address` já no CREATE TABLE
- ✅ Todos os campos geoespaciais incluídos (location_geog, city_*, neighborhood_*, approx_*)
- ✅ Índices GIST criados imediatamente
- ✅ Trigger de atualização automática de location_geog
- ✅ Sem necessidade de migrations subsequentes de ALTER TABLE

### Seeds Separados

Cada tabela tem seu próprio arquivo de seed:
- Facilita manutenção e versionamento
- Permite carga seletiva de dados
- Melhora rastreabilidade de mudanças
- Alinha com boas práticas de modularização

## Referências

- Plano completo: `docs/rup/99-anexos/MVP/plan-unify-migrations.md`
- Auditoria: `docs/rup/99-anexos/MVP/audit-lote-residuo-references.md`
- Issue: #26, #27
