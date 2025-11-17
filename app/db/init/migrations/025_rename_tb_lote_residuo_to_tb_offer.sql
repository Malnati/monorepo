-- app/db/init/migrations/025_rename_tb_lote_residuo_to_tb_offer.sql

-- ====================================================================
-- MIGRATION: Renomear tb_lote_residuo → tb_offer
-- Data: 2025-11-15
-- Descrição: Renomeia tabela e campos para nova nomenclatura offer
-- Referência: docs/rup/99-anexos/MVP/plan-unify-migrations.md
-- ====================================================================

-- Renomear tabela principal
ALTER TABLE tb_lote_residuo RENAME TO tb_offer;

-- Renomear campos
ALTER TABLE tb_offer RENAME COLUMN titulo TO title;
ALTER TABLE tb_offer RENAME COLUMN descricao TO description;
ALTER TABLE tb_offer RENAME COLUMN localizacao TO location;

-- Adicionar novos campos
ALTER TABLE tb_offer ADD COLUMN neighborhood VARCHAR(120);
ALTER TABLE tb_offer ADD COLUMN address VARCHAR(255);

-- Atualizar índices (se existirem)
-- Os índices são renomeados automaticamente pelo PostgreSQL

-- Comentários dos novos campos
COMMENT ON COLUMN tb_offer.neighborhood IS 'Nome do bairro do offer';
COMMENT ON COLUMN tb_offer.address IS 'Endereço formatado completo do offer';
COMMENT ON COLUMN tb_offer.title IS 'Título do offer (anteriormente: titulo)';
COMMENT ON COLUMN tb_offer.description IS 'Descrição detalhada do offer (anteriormente: descricao)';
COMMENT ON COLUMN tb_offer.location IS 'Coordenadas do offer no formato lat,lng (anteriormente: localizacao)';

-- Atualizar comentário da tabela
COMMENT ON TABLE tb_offer IS 'Tabela de offers de resíduos (anteriormente: tb_lote_residuo)';
