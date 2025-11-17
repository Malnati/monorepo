-- app/db/init/migrations/009_add_lot_constraints_comments.sql
-- Comentários para a migration de constraints de lotes

COMMENT ON TABLE tb_lote_residuo IS 
'Tabela de lotes de resíduos disponíveis para venda. Um lote pode ter apenas uma transação completa (quando quantidade_vendida = quantidade).';
