-- app/db/init/migrations/028_update_payment_methods_fk_to_offer.sql

-- ====================================================================
-- MIGRATION: Atualizar tb_lote_forma_pagamento para referenciar tb_offer
-- Data: 2025-11-16
-- Descrição: Renomeia coluna lote_residuo_id → offer_id em tb_lote_forma_pagamento
-- Referência: PR3 - API Core Completo
-- ====================================================================

-- Atualizar tb_lote_forma_pagamento se a coluna antiga existir
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tb_lote_forma_pagamento' 
        AND column_name = 'lote_residuo_id'
    ) THEN
        -- Remover a constraint de FK antiga
        ALTER TABLE tb_lote_forma_pagamento 
        DROP CONSTRAINT IF EXISTS tb_lote_forma_pagamento_lote_residuo_id_fkey;
        
        -- Renomear a coluna
        ALTER TABLE tb_lote_forma_pagamento 
        RENAME COLUMN lote_residuo_id TO offer_id;
        
        -- Adicionar nova constraint de FK
        ALTER TABLE tb_lote_forma_pagamento 
        ADD CONSTRAINT tb_lote_forma_pagamento_offer_id_fkey 
        FOREIGN KEY (offer_id) REFERENCES tb_offer(id) ON DELETE CASCADE;
        
        -- Atualizar índice
        DROP INDEX IF EXISTS idx_lote_forma_pagamento_lote;
        CREATE INDEX idx_lote_forma_pagamento_offer 
        ON tb_lote_forma_pagamento(offer_id);
        
        -- Comentário da coluna renomeada
        COMMENT ON COLUMN tb_lote_forma_pagamento.offer_id IS 'ID do offer associado (anteriormente: lote_residuo_id)';
    END IF;
END $$;
