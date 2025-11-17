-- app/db/init/migrations/023_rename_nome_add_descricao_comments.sql

-- Comentários idempotentes: apenas adicionar se a tabela tb_lote_residuo existir
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'tb_lote_residuo'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'tb_lote_residuo' 
            AND column_name = 'titulo'
        ) THEN
            COMMENT ON COLUMN tb_lote_residuo.titulo IS 'Título do lote de resíduo (anteriormente chamado de nome)';
        END IF;
        
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'tb_lote_residuo' 
            AND column_name = 'descricao'
        ) THEN
            COMMENT ON COLUMN tb_lote_residuo.descricao IS 'Descrição detalhada do lote de resíduo, incluindo informações sobre armazenamento, condições especiais e outros detalhes relevantes';
        END IF;
    END IF;
END $$;
