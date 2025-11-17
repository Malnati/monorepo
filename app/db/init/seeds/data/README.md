<!-- app/db/init/seeds/data/README.md -->

# Seeds - Dados de Teste e Desenvolvimento

## Contexto

Este diretório contém os **scripts de seed** que populam o banco de dados com dados de teste e desenvolvimento.

Seeds são separados de DDL para manter clara distinção entre estrutura (schema) e dados.

## Estrutura de Seeds

### Ordem de Execução (008+)

Seeds seguem numeração sequencial após DDL (001-007):

```
008_seed_fornecedores_compradores.sql   ← Populate fornecedores e compradores com avatares
009_seed_offers.sql                     ← Populate offers básicos com fotos
```

### Dependências

Seeds dependem de:
- DDL completo (001-007) executado previamente
- Imagens disponíveis em `/opt/dominio/seeds/img/`

## Imagens

### Localização

Imagens são copiadas para `/opt/dominio/seeds/` no container e referenciadas via:

```sql
pg_read_binary_file('/opt/dominio/seeds/img/arquivo.jpg')
```

### Tipos de Imagens

- **Avatares**: `avatars{grupo}_{numero}.jpg` (ex: `avatars1_1.jpg`)
  - Usados para perfis de fornecedores e compradores
  
- **Offers**: Nomes descritivos (ex: `garrafas_pet.jpg`, `computadores_monitores.jpg`)
  - Mapeamento completo em: `docs/rup/99-anexos/MVP/offer-image-mapping.md`

## Características dos Seeds

### Idempotência

Todos os seeds são idempotentes usando padrões:

```sql
-- Para inserts
INSERT INTO tabela (...)
SELECT ...
WHERE NOT EXISTS (SELECT 1 FROM tabela WHERE condicao);

-- Para updates
UPDATE tabela 
SET ...
WHERE condicao;
```

### Validação

Seeds incluem validações prévias:

```sql
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM tb_fornecedor) < 1 THEN
        RAISE EXCEPTION 'Erro: Nenhum fornecedor encontrado';
    END IF;
END $$;
```

## Estrutura de Offers

### Campos Obrigatórios

Todos os offers devem ter:
- `title`: Título descritivo
- `description`: Descrição detalhada
- `location`: Coordenadas (formato: 'lat,lng')
- `neighborhood`: Nome do bairro
- `address`: Endereço formatado completo
- `preco`: Preço por unidade
- `quantidade`: Quantidade total disponível
- `quantidade_vendida`: Quantidade vendida (geralmente 0)
- `tipo_id`: FK para tb_tipo
- `unidade_id`: FK para tb_unidade
- `fornecedor_id`: FK para tb_fornecedor

### Fotos

Cada offer deve ter pelo menos uma foto associada via `tb_fotos`:

```sql
WITH offer_insert AS (
    INSERT INTO tb_offer (...) VALUES (...) RETURNING id
)
INSERT INTO tb_fotos (offer_id, imagem, created_at, updated_at)
SELECT 
    offer_insert.id,
    pg_read_binary_file('/opt/dominio/seeds/img/nome_arquivo.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM offer_insert;
```

## Referências

- DDL modular: `../ddl/README.md`
- Mapeamento de imagens: `docs/rup/99-anexos/MVP/offer-image-mapping.md`
- Plano de migração: `docs/rup/99-anexos/MVP/plan-unify-migrations.md`
