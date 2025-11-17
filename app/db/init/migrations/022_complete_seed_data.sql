-- app/db/init/migrations/018_complete_seed_data.sql
-- Completar dados faltantes nas cargas iniciais:
-- - Adicionar e-mails aos fornecedores e compradores que não têm
-- - Adicionar fotos aos lotes que não têm imagens
-- - Garantir que todos os registros tenham dados completos

-- =====================================
-- ATUALIZAR E-MAILS DE FORNECEDORES E COMPRADORES DE TESTE
-- =====================================

-- Atualizar fornecedores de teste com e-mails
UPDATE tb_fornecedor
SET email = 'fornecedor.teste.a@dominio.com.br',
    whatsapp = COALESCE(whatsapp, '11900000001')
WHERE id = 100;

UPDATE tb_fornecedor
SET email = 'fornecedor.teste.b@dominio.com.br',
    whatsapp = COALESCE(whatsapp, '11900000002')
WHERE id = 101;

-- Atualizar compradores de teste com e-mails
UPDATE tb_comprador
SET email = 'comprador.teste.a@dominio.com.br',
    whatsapp = COALESCE(whatsapp, '11900000003')
WHERE id = 100;

UPDATE tb_comprador
SET email = 'comprador.teste.b@dominio.com.br',
    whatsapp = COALESCE(whatsapp, '11900000004')
WHERE id = 101;

UPDATE tb_comprador
SET email = 'comprador.teste.c@dominio.com.br',
    whatsapp = COALESCE(whatsapp, '11900000005')
WHERE id = 102;

-- =====================================
-- ADICIONAR FOTOS AOS LOTES DE TESTE QUE NÃO TÊM
-- =====================================

-- Lote L1: PET Incolor Teste
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote.id,
    pg_read_binary_file('/opt/dominio/seeds/residuo_001.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM tb_lote_residuo lote
WHERE lote.id = 1000
  AND NOT EXISTS (
    SELECT 1 FROM tb_fotos WHERE lote_residuo_id = lote.id
  );

-- Lote L2: Vidros Teste
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote.id,
    pg_read_binary_file('/opt/dominio/seeds/residuo_002.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM tb_lote_residuo lote
WHERE lote.id = 1001
  AND NOT EXISTS (
    SELECT 1 FROM tb_fotos WHERE lote_residuo_id = lote.id
  );

-- Lote L3: Plástico Misto Teste (VENDIDO)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote.id,
    pg_read_binary_file('/opt/dominio/seeds/residuo_003.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM tb_lote_residuo lote
WHERE lote.id = 1002
  AND NOT EXISTS (
    SELECT 1 FROM tb_fotos WHERE lote_residuo_id = lote.id
  );

-- Lote L4: Papelão Teste (VENDIDO)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote.id,
    pg_read_binary_file('/opt/dominio/seeds/residuo_004.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM tb_lote_residuo lote
WHERE lote.id = 1003
  AND NOT EXISTS (
    SELECT 1 FROM tb_fotos WHERE lote_residuo_id = lote.id
  );

-- Lote L5: Alumínio Teste
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote.id,
    pg_read_binary_file('/opt/dominio/seeds/residuo_005.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM tb_lote_residuo lote
WHERE lote.id = 1004
  AND NOT EXISTS (
    SELECT 1 FROM tb_fotos WHERE lote_residuo_id = lote.id
  );

-- =====================================
-- ADICIONAR FOTOS AOS LOTES PRINCIPAIS QUE NÃO TÊM
-- =====================================
-- Verificar e adicionar fotos aos lotes que foram criados sem imagens

DO $$
DECLARE
    lote_record RECORD;
    foto_count INTEGER;
    foto_index INTEGER := 1;
    foto_files TEXT[] := ARRAY[
        'residuo_001.jpg', 'residuo_002.jpg', 'residuo_003.jpg', 'residuo_004.jpg',
        'residuo_005.jpg', 'residuo_006.jpg', 'residuo_007.jpg', 'residuo_008.jpg',
        'residuo_009.jpg', 'residuo_010.jpg', 'residuo_011.jpg', 'residuo_012.jpg',
        'residuo_013.jpg', 'residuo_014.jpg', 'residuo_015.jpg', 'residuo_016.jpg',
        'residuo_017.jpg', 'residuo_018.jpg', 'residuo_019.jpg', 'residuo_020.jpg',
        'residuo_021.jpg', 'residuo_022.jpg', 'residuo_023.jpg', 'residuo_024.jpg',
        'residuo_025.jpg', 'residuo_026.jpg', 'residuo_027.jpg', 'residuo_028.jpg',
        'residuo_029.jpg', 'residuo_030.jpg', 'residuo_031.jpg', 'residuo_032.jpg',
        'residuo_033.jpg', 'residuo_034.jpg', 'residuo_035.jpg', 'residuo_036.jpg'
    ];
BEGIN
    -- Para cada lote que não tem fotos, adicionar uma foto
    FOR lote_record IN 
        SELECT id, titulo AS nome
        FROM tb_lote_residuo
        WHERE id NOT IN (SELECT DISTINCT lote_residuo_id FROM tb_fotos)
        ORDER BY id
    LOOP
        -- Usar uma foto baseada no ID do lote (módulo para garantir que sempre tenha uma)
        foto_index := ((lote_record.id - 1) % array_length(foto_files, 1)) + 1;
        
        INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
        VALUES (
            lote_record.id,
            pg_read_binary_file('/opt/dominio/seeds/' || foto_files[foto_index]),
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );
        
        RAISE NOTICE 'Foto adicionada ao lote ID: %, Nome: %, Arquivo: %', 
            lote_record.id, lote_record.nome, foto_files[foto_index];
    END LOOP;
END $$;

-- =====================================
-- GARANTIR E-MAILS E WHATSAPP EM TODOS OS FORNECEDORES
-- =====================================

-- Atualizar fornecedores sem e-mail com e-mails padrão baseados no nome
-- Substituir todos os acentos e caracteres especiais para garantir formato válido de email
UPDATE tb_fornecedor
SET email = LOWER(
    TRANSLATE(
        REPLACE(nome, ' ', '.'),
        'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
        'aaaaaeeeeiiiioooouuuucnaaaaaeeeeiiiioooouuuucn'
    )
) || '@dominio.com.br',
    whatsapp = COALESCE(whatsapp, '11999999999')
WHERE email IS NULL;

-- =====================================
-- GARANTIR E-MAILS E WHATSAPP EM TODOS OS COMPRADORES
-- =====================================

-- Atualizar compradores sem e-mail com e-mails padrão baseados no nome
-- Substituir todos os acentos e caracteres especiais para garantir formato válido de email
UPDATE tb_comprador
SET email = LOWER(
    TRANSLATE(
        REPLACE(nome, ' ', '.'),
        'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
        'aaaaaeeeeiiiioooouuuucnaaaaaeeeeiiiioooouuuucn'
    )
) || '@dominio.com.br',
    whatsapp = COALESCE(whatsapp, '11999999999')
WHERE email IS NULL;

-- =====================================
-- VALIDAÇÃO FINAL
-- =====================================

DO $$
DECLARE
    fornecedores_sem_email INTEGER;
    compradores_sem_email INTEGER;
    fornecedores_sem_whatsapp INTEGER;
    compradores_sem_whatsapp INTEGER;
    lotes_sem_fotos INTEGER;
BEGIN
    -- Verificar fornecedores sem e-mail
    SELECT COUNT(*) INTO fornecedores_sem_email
    FROM tb_fornecedor
    WHERE email IS NULL;
    
    -- Verificar compradores sem e-mail
    SELECT COUNT(*) INTO compradores_sem_email
    FROM tb_comprador
    WHERE email IS NULL;
    
    -- Verificar fornecedores sem whatsapp
    SELECT COUNT(*) INTO fornecedores_sem_whatsapp
    FROM tb_fornecedor
    WHERE whatsapp IS NULL;
    
    -- Verificar compradores sem whatsapp
    SELECT COUNT(*) INTO compradores_sem_whatsapp
    FROM tb_comprador
    WHERE whatsapp IS NULL;
    
    -- Verificar lotes sem fotos
    SELECT COUNT(*) INTO lotes_sem_fotos
    FROM tb_lote_residuo
    WHERE id NOT IN (SELECT DISTINCT lote_residuo_id FROM tb_fotos);
    
    IF fornecedores_sem_email > 0 THEN
        RAISE WARNING 'Ainda existem % fornecedores sem e-mail', fornecedores_sem_email;
    END IF;
    
    IF compradores_sem_email > 0 THEN
        RAISE WARNING 'Ainda existem % compradores sem e-mail', compradores_sem_email;
    END IF;
    
    IF fornecedores_sem_whatsapp > 0 THEN
        RAISE WARNING 'Ainda existem % fornecedores sem whatsapp', fornecedores_sem_whatsapp;
    END IF;
    
    IF compradores_sem_whatsapp > 0 THEN
        RAISE WARNING 'Ainda existem % compradores sem whatsapp', compradores_sem_whatsapp;
    END IF;
    
    IF lotes_sem_fotos > 0 THEN
        RAISE WARNING 'Ainda existem % lotes sem fotos', lotes_sem_fotos;
    END IF;
    
    RAISE NOTICE 'Validação concluída: Fornecedores sem email: %, Compradores sem email: %, Fornecedores sem whatsapp: %, Compradores sem whatsapp: %, Lotes sem fotos: %',
        fornecedores_sem_email, compradores_sem_email, fornecedores_sem_whatsapp, compradores_sem_whatsapp, lotes_sem_fotos;
END $$;

