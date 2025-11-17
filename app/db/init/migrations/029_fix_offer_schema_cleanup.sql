-- app/db/init/migrations/029_fix_offer_schema_cleanup.sql

-- ====================================================================
-- MIGRATION: Limpeza do schema tb_offer e correção de referências
-- Data: 2025-11-16
-- Descrição: Remove campo 'nome' duplicado de tb_offer e colunas lote_residuo_id obsoletas
-- ====================================================================

-- Remover campo 'nome' de tb_offer (mantendo apenas title e description)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tb_offer' 
        AND column_name = 'nome'
    ) THEN
        -- Migrar dados de nome para title se title estiver vazio
        UPDATE tb_offer SET title = nome WHERE (title IS NULL OR title = '') AND nome IS NOT NULL;
        
        -- Remover coluna nome
        ALTER TABLE tb_offer DROP COLUMN nome;
    END IF;
END $$;

-- Remover coluna lote_residuo_id de tb_transacao (mantendo apenas offer_id)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tb_transacao' 
        AND column_name = 'lote_residuo_id'
    ) THEN
        -- Migrar dados se necessário
        UPDATE tb_transacao SET offer_id = lote_residuo_id WHERE offer_id IS NULL AND lote_residuo_id IS NOT NULL;
        
        -- Remover constraint antiga se existir
        ALTER TABLE tb_transacao DROP CONSTRAINT IF EXISTS tb_transacao_lote_residuo_id_fkey;
        
        -- Remover coluna
        ALTER TABLE tb_transacao DROP COLUMN lote_residuo_id;
    END IF;
END $$;

-- Remover coluna lote_residuo_id de tb_fotos (mantendo apenas offer_id)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tb_fotos' 
        AND column_name = 'lote_residuo_id'
    ) THEN
        -- Migrar dados se necessário
        UPDATE tb_fotos SET offer_id = lote_residuo_id WHERE offer_id IS NULL AND lote_residuo_id IS NOT NULL;
        
        -- Remover constraint antiga se existir
        ALTER TABLE tb_fotos DROP CONSTRAINT IF EXISTS tb_fotos_lote_residuo_id_fkey;
        
        -- Remover coluna
        ALTER TABLE tb_fotos DROP COLUMN lote_residuo_id;
    END IF;
END $$;

-- Comentários
COMMENT ON COLUMN tb_offer.title IS 'Título do offer (campo único, nome removido)';
COMMENT ON COLUMN tb_transacao.offer_id IS 'ID do offer transacionado (lote_residuo_id removido)';
COMMENT ON COLUMN tb_fotos.offer_id IS 'ID do offer associado (lote_residuo_id removido)';
