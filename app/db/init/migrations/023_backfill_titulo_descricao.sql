-- app/db/init/migrations/023_backfill_titulo_descricao.sql
-- Preencher campo descricao para lotes existentes com informações genéricas

-- Atualizar lotes existentes com descrições baseadas no título
UPDATE tb_lote_residuo
SET descricao = CASE 
    WHEN descricao IS NULL OR descricao = '' THEN 
        'Lote de ' || LOWER(titulo) || '. Material em bom estado, pronto para transporte e processamento. Entre em contato para mais informações sobre armazenamento e condições específicas.'
    ELSE descricao
END
WHERE descricao IS NULL OR descricao = '';
