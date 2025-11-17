-- app/db/init/migrations/009_add_lot_constraints.sql
-- Adicionar constraints para garantir integridade das vendas de lotes

-- Constraint para garantir que quantidade_vendida nunca exceda quantidade
ALTER TABLE tb_lote_residuo 
ADD CONSTRAINT chk_quantidade_vendida_valida 
CHECK (quantidade_vendida <= quantidade);

-- Comentários explicativos
COMMENT ON CONSTRAINT chk_quantidade_vendida_valida ON tb_lote_residuo IS 
'Garante que a quantidade vendida nunca exceda a quantidade total disponível do lote';
