<!-- app/db/init/ddl/README.md -->

# DDL - Definições de Estrutura de Dados

## Contexto

Este diretório contém as **migrations modulares de DDL** (Data Definition Language) que criam a estrutura base do banco de dados.

Cada arquivo cria uma tabela específica com seus comentários, mantendo a separação clara entre definição de estrutura (DDL) e dados (Seeds).

## Estrutura Modular

### Ordem de Execução (001-007)

As migrations DDL seguem ordem alfabética de execução respeitando dependências:

```
001_ddl_tb_tipo.sql          ← Tipos de resíduo (sem dependências)
002_ddl_tb_unidade.sql       ← Unidades de medida (sem dependências)
003_ddl_tb_fornecedor.sql    ← Fornecedores (sem dependências)
004_ddl_tb_comprador.sql     ← Compradores (sem dependências)
005_ddl_tb_offer.sql         ← Offers (FK: tipo, unidade, fornecedor)
006_ddl_tb_fotos.sql         ← Fotos (FK: offer)
007_ddl_tb_transacao.sql     ← Transações (FK: fornecedor, comprador, offer)
```

## Características

### Tabela tb_offer (Native)

A tabela `tb_offer` é criada **nativamente** com todos os campos essenciais desde o início:

- `title` - Título do offer
- `description` - Descrição detalhada
- `location` - Coordenadas no formato lat,lng
- `neighborhood` - Nome do bairro
- `address` - Endereço formatado completo
- Campos de negócio: `preco`, `quantidade`, `quantidade_vendida`
- Relacionamentos: `tipo_id`, `unidade_id`, `fornecedor_id`

**Importante:** Não há mais renomeação de `tb_lote_residuo` para `tb_offer`. A tabela já nasce como `tb_offer`.

### Seeds Inline

Tabelas que requerem dados críticos mínimos incluem seeds inline:

- **tb_tipo**: Tipos básicos (Orgânico, Reciclável, Perigoso, Eletrônico, Hospitalar, Construção)
- **tb_unidade**: Unidades base (Toneladas, m²)
- **tb_fornecedor**: Fornecedor Padrão (id=1)

## Migrations Adicionais

Após a estrutura base (001-007), migrations adicionais serão numeradas sequencialmente:

- **008+**: Campos geoespaciais, índices, views, constraints e outras alterações incrementais

## Referências

- Plano completo: `docs/rup/99-anexos/MVP/plan-unify-migrations.md`
- Seeds de dados: `../seeds/data/README.md`
- Auditoria de migração: `docs/rup/99-anexos/MVP/audit-lote-residuo-references.md`
