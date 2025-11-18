<!-- app/db/MIGRATION_GUIDE.md -->

# Guia de Migração - Estrutura Modular de Migrations e Seeds

## Visão Geral

Este guia documenta a transição da estrutura monolítica de migrations (`001_create_schema.sql`) para a estrutura modular organizada em `init/ddl/` e `init/seeds/data/`.

## Motivação

A estrutura modular oferece:

- **Manutenibilidade**: Cada tabela em seu próprio arquivo
- **Clareza**: Separação clara entre DDL e dados
- **Rastreabilidade**: Mudanças isoladas e granulares
- **Testabilidade**: Validação independente por tabela
- **Eliminação de ALTER TABLE**: tb_offer criada nativamente com todos os campos

## Estrutura Nova vs Antiga

### Antiga (Monolítica)

```
init/migrations/
├── 001_create_schema.sql          ← TODAS as tabelas (tb_lote_residuo)
├── 002-024_*.sql                  ← Migrations incrementais
├── 025_rename_tb_lote_residuo_to_tb_offer.sql  ← Renomeia tabela
├── 026_update_fk_references_to_offer.sql       ← Atualiza FKs
└── 027_update_view_available_lots_for_offer.sql ← Atualiza views
```

### Nova (Modular)

```
init/
├── ddl/                           ← Estrutura base
│   ├── 001_ddl_tb_tipo.sql        ← Tipos (com seed inline)
│   ├── 002_ddl_tb_unidade.sql     ← Unidades (com seed inline)
│   ├── 003_ddl_tb_fornecedor.sql  ← Fornecedores (com seed padrão)
│   ├── 004_ddl_tb_comprador.sql   ← Compradores
│   ├── 005_ddl_tb_offer.sql       ← **tb_offer NATIVA** (não mais tb_lote_residuo)
│   ├── 006_ddl_tb_fotos.sql       ← Fotos (FK: offer_id)
│   └── 007_ddl_tb_transacao.sql   ← Transações (FK: offer_id)
├── seeds/
│   ├── data/
│   │   ├── 008_seed_fornecedores_compradores.sql  ← Dados com avatares
│   │   └── 009_seed_offers.sql                    ← Offers com fotos
│   └── img/                       ← Imagens (avatares + offers)
└── migrations/                    ← Legacy (mantido para compatibilidade)
```

## Principais Mudanças

### 1. tb_offer Nativa

**Antes:**

```sql
-- 001_create_schema.sql
CREATE TABLE tb_lote_residuo (
    nome VARCHAR(255),
    localizacao VARCHAR(255),
    ...
);

-- 025_rename_tb_lote_residuo_to_tb_offer.sql
ALTER TABLE tb_lote_residuo RENAME TO tb_offer;
ALTER TABLE tb_offer RENAME COLUMN nome TO title;
ALTER TABLE tb_offer RENAME COLUMN localizacao TO location;
ALTER TABLE tb_offer ADD COLUMN neighborhood VARCHAR(120);
ALTER TABLE tb_offer ADD COLUMN address VARCHAR(255);
```

**Agora:**

```sql
-- 005_ddl_tb_offer.sql
CREATE TABLE IF NOT EXISTS tb_offer (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    neighborhood VARCHAR(120),
    address VARCHAR(255),
    -- ... outros campos
);
```

✅ **Benefício**: Não há mais necessidade de migrations de renomeação (025-027)

### 2. Referências FK Corretas desde o Início

**Antes:**

```sql
-- tb_fotos com lote_residuo_id
CREATE TABLE tb_fotos (
    lote_residuo_id INT REFERENCES tb_lote_residuo(id)
);

-- 026_update_fk_references_to_offer.sql
ALTER TABLE tb_fotos RENAME COLUMN lote_residuo_id TO offer_id;
```

**Agora:**

```sql
-- 006_ddl_tb_fotos.sql
CREATE TABLE IF NOT EXISTS tb_fotos (
    offer_id INT NOT NULL REFERENCES tb_offer(id) ON DELETE CASCADE
);
```

✅ **Benefício**: FKs consistentes desde o início, sem necessidade de renomeação

### 3. Separação DDL vs Seeds

**Antes:**

- Seeds misturados com DDL em `003_seed_lotes_residuos.sql`
- Dificulta manutenção e versionamento

**Agora:**

- DDL puro em `init/ddl/` (001-007)
- Seeds separados em `init/seeds/data/` (008+)
- Imagens organizadas em `init/seeds/img/`

## Como Usar a Estrutura Modular

### Desenvolvimento Local

#### 1. Testar Migrations Modulares

```bash
cd db

# Gerar arquivo consolidado
./test-modular-migrations.sh

# Validar em banco real
./validate-modular-schema.sh
```

#### 2. Verificar Schema Resultante

```bash
# Schema gerado
cat /tmp/modular-migrations-test/schema_modular.sql

# Comparar com legacy (se necessário)
# Executar migrations legacy e comparar schemas
```

### Integração com Docker

#### Opção A: Usar Estrutura Modular (Recomendado para novos ambientes)

```dockerfile
# Dockerfile
COPY init/ddl /docker-entrypoint-initdb.d/ddl/
COPY init/seeds/data /docker-entrypoint-initdb.d/seeds/
COPY init/seeds/img /opt/dominio/seeds/img/
```

```yaml
# docker-compose.yml
volumes:
  - ./app/db/init/ddl:/docker-entrypoint-initdb.d/ddl:ro
  - ./app/db/init/seeds/data:/docker-entrypoint-initdb.d/seeds:ro
  - ./app/db/init/seeds/img:/opt/dominio/seeds/img:ro
```

#### Opção B: Manter Legacy (Ambiente existente)

```yaml
# docker-compose.yml (atual)
volumes:
  - ./app/db/init/migrations:/docker-entrypoint-initdb.d:ro
```

⚠️ **Nota**: PostgreSQL executa arquivos em ordem alfabética. Com estrutura de diretórios:

- `ddl/` será executado antes de `seeds/` (ordem alfabética)
- Dentro de cada diretório, arquivos são executados em ordem numérica

## Validação de Schema

### Campos Obrigatórios de tb_offer

```sql
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'tb_offer'
ORDER BY ordinal_position;
```

**Esperado:**

- ✅ `title` VARCHAR(255) NOT NULL
- ✅ `description` TEXT
- ✅ `location` VARCHAR(255)
- ✅ `neighborhood` VARCHAR(120)
- ✅ `address` VARCHAR(255)
- ✅ Campos de negócio: `preco`, `quantidade`, `quantidade_vendida`
- ✅ FKs: `tipo_id`, `unidade_id`, `fornecedor_id`

### Verificar Relacionamentos

```sql
-- tb_fotos deve referenciar tb_offer
SELECT
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'tb_fotos'
    AND tc.constraint_type = 'FOREIGN KEY';
```

**Esperado:**

- ✅ `offer_id` → `tb_offer(id)`

## Plano de Transição

### Fase 1: Validação (Atual) ✅

- [x] Criar estrutura modular
- [x] Implementar tb_offer nativa
- [x] Separar DDL e seeds
- [x] Criar ferramentas de teste
- [x] Validar schema equivalente

### Fase 2: Integração

- [ ] Atualizar Dockerfile para copiar estrutura modular
- [ ] Atualizar docker-compose.yml (modo opt-in)
- [ ] Documentar modo de uso
- [ ] Testar em ambiente de desenvolvimento

### Fase 3: Migração Gradual

- [ ] Criar flag de feature para escolher estrutura
- [ ] Migrar ambientes de desenvolvimento primeiro
- [ ] Validar em staging
- [ ] Planejar migração de produção

### Fase 4: Deprecação Legacy

- [ ] Mover migrations legacy para `/legacy/`
- [ ] Atualizar documentação
- [ ] Remover migrations de renomeação (025-027)

## Rollback

Se necessário retornar à estrutura antiga:

```bash
# 1. Reverter docker-compose.yml
git checkout HEAD -- docker-compose.yml

# 2. Limpar volumes
docker-compose down -v

# 3. Rebuild com estrutura legacy
docker-compose up -d db
```

## FAQ

### Por que não deprecar migrations 025-027 imediatamente?

Mantemos compatibilidade com ambientes existentes que usam a estrutura legacy. A transição é gradual e controlada.

### Posso usar apenas parte da estrutura modular?

Sim, mas recomendamos transição completa para evitar inconsistências. As validações garantem equivalência total.

### Como adicionar novas tabelas?

```bash
# 1. Criar DDL modular
touch init/ddl/008_ddl_tb_nova_tabela.sql

# 2. Criar seed (se necessário)
touch init/seeds/data/010_seed_nova_tabela.sql

# 3. Testar
./validate-modular-schema.sh
```

### Como migrar dados existentes?

A estrutura modular é para **novos ambientes**. Ambientes existentes continuam usando migrations legacy até migração planejada.

## Referências

- Plano completo: `docs/rup/99-anexos/MVP/plan-unify-migrations.md`
- Auditoria de referências: `docs/rup/99-anexos/MVP/audit-lote-residuo-references.md`
- Estrutura DDL: `init/ddl/README.md`
- Estrutura Seeds: `init/seeds/data/README.md`
- Mapeamento de imagens: `docs/rup/99-anexos/MVP/offer-image-mapping.md`
