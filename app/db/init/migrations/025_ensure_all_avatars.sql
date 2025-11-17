-- app/db/init/migrations/017_ensure_all_avatars.sql
-- Garantir que todos os fornecedores e compradores tenham avatares
-- Distribui os 20 avatares disponíveis de forma circular
-- Esta migração deve ser executada após todas as outras que criam fornecedores/compradores

-- =====================================
-- FORNECEDORES SEM AVATAR
-- =====================================

DO $$
DECLARE
    fornecedor_rec RECORD;
    avatar_index INTEGER := 1;
    avatar_files TEXT[] := ARRAY[
        'avatars1_1.jpg', 'avatars1_2.jpg', 'avatars1_3.jpg', 'avatars1_4.jpg',
        'avatars2_1.jpg', 'avatars2_2.jpg', 'avatars2_3.jpg', 'avatars2_4.jpg',
        'avatars3_1.jpg', 'avatars3_2.jpg', 'avatars3_3.jpg', 'avatars3_4.jpg',
        'avatars4_1.jpg', 'avatars4_2.jpg', 'avatars4_3.jpg', 'avatars4_4.jpg',
        'avatars5_1.jpg', 'avatars5_2.jpg', 'avatars5_3.jpg', 'avatars5_4.jpg'
    ];
    avatar_path TEXT;
    avatar_data BYTEA;
    fornecedor_count INTEGER := 0;
    fornecedor_updated_count INTEGER := 0;
BEGIN
    -- Contar fornecedores sem avatar
    SELECT COUNT(*) INTO fornecedor_count
    FROM tb_fornecedor
    WHERE avatar IS NULL;
    
    IF fornecedor_count = 0 THEN
        RAISE NOTICE 'Todos os fornecedores já possuem avatares';
    ELSE
        RAISE NOTICE 'Atualizando % fornecedores sem avatar', fornecedor_count;
        
        -- Atualizar todos os fornecedores sem avatar
        FOR fornecedor_rec IN 
            SELECT id FROM tb_fornecedor WHERE avatar IS NULL ORDER BY id
        LOOP
            -- Calcular índice do avatar (distribuição circular)
            avatar_index := ((fornecedor_rec.id - 1) % array_length(avatar_files, 1)) + 1;
            avatar_path := '/opt/dominio/seeds/img/' || avatar_files[avatar_index];
            
            -- Atualizar fornecedor com avatar
            BEGIN
                -- Verificar se o arquivo existe antes de tentar ler
                avatar_data := pg_read_binary_file(avatar_path);
                
                IF avatar_data IS NULL OR length(avatar_data) = 0 THEN
                    RAISE WARNING 'Avatar vazio ou não encontrado: % para fornecedor ID %', avatar_path, fornecedor_rec.id;
                ELSE
                    UPDATE tb_fornecedor 
                    SET avatar = avatar_data,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = fornecedor_rec.id;
                    
                    fornecedor_updated_count := fornecedor_updated_count + 1;
                    RAISE NOTICE 'Avatar atribuído ao fornecedor ID %: % (% bytes)', 
                        fornecedor_rec.id, avatar_files[avatar_index], length(avatar_data);
                END IF;
            EXCEPTION 
                WHEN OTHERS THEN
                    RAISE WARNING 'Erro ao carregar avatar % para fornecedor ID %: %', 
                        avatar_path, fornecedor_rec.id, SQLERRM;
            END;
        END LOOP;
        
        RAISE NOTICE 'Fornecedores atualizados: % de %', fornecedor_updated_count, fornecedor_count;
    END IF;
END $$;

-- =====================================
-- COMPRADORES SEM AVATAR
-- =====================================

DO $$
DECLARE
    comprador_rec RECORD;
    avatar_index INTEGER := 1;
    avatar_files TEXT[] := ARRAY[
        'avatars1_1.jpg', 'avatars1_2.jpg', 'avatars1_3.jpg', 'avatars1_4.jpg',
        'avatars2_1.jpg', 'avatars2_2.jpg', 'avatars2_3.jpg', 'avatars2_4.jpg',
        'avatars3_1.jpg', 'avatars3_2.jpg', 'avatars3_3.jpg', 'avatars3_4.jpg',
        'avatars4_1.jpg', 'avatars4_2.jpg', 'avatars4_3.jpg', 'avatars4_4.jpg',
        'avatars5_1.jpg', 'avatars5_2.jpg', 'avatars5_3.jpg', 'avatars5_4.jpg'
    ];
    avatar_path TEXT;
    avatar_data BYTEA;
    comprador_count INTEGER := 0;
    comprador_updated_count INTEGER := 0;
BEGIN
    -- Contar compradores sem avatar
    SELECT COUNT(*) INTO comprador_count
    FROM tb_comprador
    WHERE avatar IS NULL;
    
    IF comprador_count = 0 THEN
        RAISE NOTICE 'Todos os compradores já possuem avatares';
    ELSE
        RAISE NOTICE 'Atualizando % compradores sem avatar', comprador_count;
        
        -- Atualizar todos os compradores sem avatar
        FOR comprador_rec IN 
            SELECT id FROM tb_comprador WHERE avatar IS NULL ORDER BY id
        LOOP
            -- Calcular índice do avatar (distribuição circular)
            avatar_index := ((comprador_rec.id - 1) % array_length(avatar_files, 1)) + 1;
            avatar_path := '/opt/dominio/seeds/img/' || avatar_files[avatar_index];
            
            -- Atualizar comprador com avatar
            BEGIN
                -- Verificar se o arquivo existe antes de tentar ler
                avatar_data := pg_read_binary_file(avatar_path);
                
                IF avatar_data IS NULL OR length(avatar_data) = 0 THEN
                    RAISE WARNING 'Avatar vazio ou não encontrado: % para comprador ID %', avatar_path, comprador_rec.id;
                ELSE
                    UPDATE tb_comprador 
                    SET avatar = avatar_data,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = comprador_rec.id;
                    
                    comprador_updated_count := comprador_updated_count + 1;
                    RAISE NOTICE 'Avatar atribuído ao comprador ID %: % (% bytes)', 
                        comprador_rec.id, avatar_files[avatar_index], length(avatar_data);
                END IF;
            EXCEPTION 
                WHEN OTHERS THEN
                    RAISE WARNING 'Erro ao carregar avatar % para comprador ID %: %', 
                        avatar_path, comprador_rec.id, SQLERRM;
            END;
        END LOOP;
        
        RAISE NOTICE 'Compradores atualizados: % de %', comprador_updated_count, comprador_count;
    END IF;
END $$;

-- =====================================
-- VALIDAÇÃO
-- =====================================

DO $$
DECLARE
    fornecedores_sem_avatar INTEGER;
    compradores_sem_avatar INTEGER;
BEGIN
    -- Contar fornecedores sem avatar
    SELECT COUNT(*) INTO fornecedores_sem_avatar
    FROM tb_fornecedor
    WHERE avatar IS NULL;
    
    -- Contar compradores sem avatar
    SELECT COUNT(*) INTO compradores_sem_avatar
    FROM tb_comprador
    WHERE avatar IS NULL;
    
    IF fornecedores_sem_avatar > 0 THEN
        RAISE WARNING 'Ainda existem % fornecedores sem avatar', fornecedores_sem_avatar;
    END IF;
    
    IF compradores_sem_avatar > 0 THEN
        RAISE WARNING 'Ainda existem % compradores sem avatar', compradores_sem_avatar;
    END IF;
    
    IF fornecedores_sem_avatar = 0 AND compradores_sem_avatar = 0 THEN
        RAISE NOTICE 'Todos os fornecedores e compradores possuem avatares';
    END IF;
END $$;

