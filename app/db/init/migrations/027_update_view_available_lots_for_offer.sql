-- app/db/init/migrations/027_update_view_available_lots_for_offer.sql

-- ====================================================================
-- MIGRATION: Atualizar view para usar tb_offer
-- Data: 2025-11-15
-- Descrição: Atualiza vw_lotes_disponiveis para referenciar tb_offer
-- Referência: docs/rup/99-anexos/MVP/audit-lote-residuo-references.md
-- ====================================================================

-- Recriar view com novos nomes de tabela e coluna
-- DROP primeiro para permitir mudança de nomes de colunas
DROP VIEW IF EXISTS vw_lotes_disponiveis;

CREATE VIEW vw_lotes_disponiveis AS
SELECT 
    o.*,
    CASE 
        WHEN t.id IS NULL THEN true
        ELSE false
    END as esta_disponivel
FROM tb_offer o
LEFT JOIN tb_transacao t ON t.offer_id = o.id
WHERE t.id IS NULL AND o.quantidade_vendida = 0;

COMMENT ON VIEW vw_lotes_disponiveis IS 
'View que retorna apenas offers disponíveis para compra (sem transações e com quantidade_vendida = 0). Renomeada para referenciar tb_offer.';
