-- app/db/init/migrations/010_add_lot_constraints.sql
-- Adicionar constraints para garantir integridade das vendas de lotes (se ainda não existir)

-- Constraint para garantir que quantidade_vendida nunca exceda quantidade
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_quantidade_vendida_valida' 
        AND conrelid = 'tb_lote_residuo'::regclass
    ) THEN
        ALTER TABLE tb_lote_residuo 
        ADD CONSTRAINT chk_quantidade_vendida_valida 
        CHECK (quantidade_vendida <= quantidade);
    END IF;
END $$;

-- Comentários explicativos (sempre atualizar, mesmo se constraint já existir)
COMMENT ON CONSTRAINT chk_quantidade_vendida_valida ON tb_lote_residuo IS 
'Garante que a quantidade vendida nunca exceda a quantidade total disponível do lote';
