-- app/db/init/migrations/026_update_fk_references_to_offer.sql

-- ====================================================================
-- MIGRATION: Atualizar referências FK para tb_offer
-- Data: 2025-11-15
-- Descrição: Renomeia colunas lote_residuo_id → offer_id em tabelas dependentes
-- Referência: docs/rup/99-anexos/MVP/audit-lote-residuo-references.md
-- ====================================================================

-- Atualizar tb_fotos
ALTER TABLE tb_fotos RENAME COLUMN lote_residuo_id TO offer_id;

-- Atualizar tb_transacao
ALTER TABLE tb_transacao RENAME COLUMN lote_residuo_id TO offer_id;

-- Atualizar tb_payment_method_offer (se existir)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tb_payment_method_offer' 
        AND column_name = 'lote_residuo_id'
    ) THEN
        ALTER TABLE tb_payment_method_offer RENAME COLUMN lote_residuo_id TO offer_id;
    END IF;
END $$;

-- Comentários das colunas renomeadas
COMMENT ON COLUMN tb_fotos.offer_id IS 'ID do offer associado (anteriormente: lote_residuo_id)';
COMMENT ON COLUMN tb_transacao.offer_id IS 'ID do offer transacionado (anteriormente: lote_residuo_id)';
