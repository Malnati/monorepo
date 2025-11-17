-- app/db/init/migrations/023_rename_nome_add_descricao.sql
-- Renomear campo 'nome' para 'titulo' e adicionar campo 'descricao' em tb_lote_residuo
-- Script idempotente: verifica se a coluna 'nome' existe antes de renomear

-- Verificar se a tabela tb_lote_residuo existe e se a coluna nome ainda existe
DO $$
BEGIN
    -- Verificar se a tabela tb_lote_residuo existe
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'tb_lote_residuo'
    ) THEN
        -- Adicionar coluna descricao (nullable temporariamente para permitir migração)
        ALTER TABLE tb_lote_residuo
        ADD COLUMN IF NOT EXISTS descricao TEXT;

        -- Renomear coluna nome para titulo apenas se a coluna nome existir
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'tb_lote_residuo' 
            AND column_name = 'nome'
        ) THEN
            ALTER TABLE tb_lote_residuo
            RENAME COLUMN nome TO titulo;
        END IF;
    END IF;
END $$;

-- Atualizar views dependentes apenas se a tabela tb_lote_residuo ainda existir
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'tb_lote_residuo'
    ) THEN
        -- Atualizar views dependentes
        DROP VIEW IF EXISTS vw_lotes_publicados;
        DROP VIEW IF EXISTS vw_lotes_disponiveis;

        -- Recriar view vw_lotes_publicados com nova nomenclatura
        CREATE OR REPLACE VIEW vw_lotes_publicados AS
        SELECT 
            lr.id,
            lr.titulo,
            lr.descricao,
            lr.preco,
            lr.quantidade,
            lr.quantidade_vendida,
            lr.localizacao,
            lr.location_geog,
            lr.formatted_address,
            lr.place_id,
            lr.geocoding_accuracy,
            lr.city_name,
            lr.city_location_raw,
            lr.city_location_geog,
            lr.neighborhood_name,
            lr.neighborhood_location_raw,
            lr.neighborhood_location_geog,
            lr.tipo_id,
            lr.unidade_id,
            lr.fornecedor_id,
            lr.created_at,
            lr.updated_at,
            t.nome AS tipo_nome,
            u.nome AS unidade_nome,
            f.nome AS fornecedor_nome,
            f.whatsapp AS fornecedor_whatsapp,
            f.email AS fornecedor_email,
            CASE 
                WHEN EXISTS (
                    SELECT 1 FROM tb_transacao tr 
                    WHERE tr.lote_residuo_id = lr.id
                ) THEN false
                ELSE true
            END AS disponivel
        FROM tb_lote_residuo lr
        LEFT JOIN tb_tipo t ON lr.tipo_id = t.id
        LEFT JOIN tb_unidade u ON lr.unidade_id = u.id
        LEFT JOIN tb_fornecedor f ON lr.fornecedor_id = f.id;

        -- Backfill descricao com valores vazios onde necessário (será preenchido depois)
        UPDATE tb_lote_residuo
        SET descricao = COALESCE(descricao, '')
        WHERE descricao IS NULL;

        -- Tornar descricao obrigatório após backfill
        ALTER TABLE tb_lote_residuo
        ALTER COLUMN descricao SET NOT NULL;

        -- Recriar view vw_lotes_disponiveis com nova nomenclatura
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
    END IF;
END $$;
