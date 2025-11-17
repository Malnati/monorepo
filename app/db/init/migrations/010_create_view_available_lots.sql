-- app/db/init/migrations/010_create_view_available_lots.sql
-- View para consultar lotes disponíveis (sem transações concluídas)

CREATE OR REPLACE VIEW vw_lotes_disponiveis AS
SELECT 
    l.*,
    CASE 
        WHEN t.id IS NULL THEN true
        ELSE false
    END as esta_disponivel
FROM tb_lote_residuo l
LEFT JOIN tb_transacao t ON t.lote_residuo_id = l.id
WHERE t.id IS NULL AND l.quantidade_vendida = 0;

COMMENT ON VIEW vw_lotes_disponiveis IS 
'View que retorna apenas lotes disponíveis para compra (sem transações e com quantidade_vendida = 0)';
