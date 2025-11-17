-- app/db/init/migrations/031_update_view_published_lots_for_offer.sql

-- ====================================================================
-- MIGRATION: Atualizar vw_lotes_publicados para usar tb_offer
-- Data: 2025-01-XX
-- Descrição: Atualiza vw_lotes_publicados para referenciar tb_offer e usar novos nomes de campos
-- Referência: Schema de referência db-schema.sql
-- ====================================================================

-- Recriar view com novos nomes de tabela e colunas
CREATE OR REPLACE VIEW vw_lotes_publicados AS
SELECT 
    o.id,
    o.title AS titulo,
    o.description AS descricao,
    o.preco,
    o.quantidade,
    o.quantidade_vendida,
    o.location AS localizacao,
    o.location_geog,
    o.formatted_address,
    o.place_id,
    o.geocoding_accuracy,
    o.city_name,
    o.city_location_raw,
    o.city_location_geog,
    o.neighborhood_name,
    o.neighborhood_location_raw,
    o.neighborhood_location_geog,
    o.tipo_id,
    o.unidade_id,
    o.fornecedor_id,
    o.created_at,
    o.updated_at,
    t.nome AS tipo_nome,
    u.nome AS unidade_nome,
    f.nome AS fornecedor_nome,
    f.whatsapp AS fornecedor_whatsapp,
    f.email AS fornecedor_email,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM tb_transacao tr 
            WHERE tr.offer_id = o.id
        ) THEN false
        ELSE true
    END AS disponivel
FROM tb_offer o
LEFT JOIN tb_tipo t ON o.tipo_id = t.id
LEFT JOIN tb_unidade u ON o.unidade_id = u.id
LEFT JOIN tb_fornecedor f ON o.fornecedor_id = f.id;

COMMENT ON VIEW vw_lotes_publicados IS 
'View que retorna offers publicados com informações relacionadas (tipo, unidade, fornecedor). Atualizada para referenciar tb_offer e usar novos nomes de campos.';
