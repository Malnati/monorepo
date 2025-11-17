-- app/db/init/migrations/011_seed_test_scenarios.sql
-- Seeds para cenários de teste de restrições de compra e visibilidade de lotes
-- Conforme plano em docs/rup/99-anexos/MVP/plano-bug-fix-details-lote.md
--
-- ATUALIZAÇÃO (2025-11-16): Imagens atualizadas para usar nomes descritivos
--   - Referência: docs/rup/99-anexos/MVP/offer-image-mapping.md

-- =====================================
-- USUÁRIOS DE TESTE
-- =====================================

-- Usuário A: tem fornecedor FA e comprador CA
INSERT INTO tb_user (id, email, created_at, updated_at) VALUES
(100, 'usuario.a@teste.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Usuário B: tem fornecedor FB e comprador CB
INSERT INTO tb_user (id, email, created_at, updated_at) VALUES
(101, 'usuario.b@teste.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Usuário C: apenas comprador CC
INSERT INTO tb_user (id, email, created_at, updated_at) VALUES
(102, 'usuario.c@teste.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Sincronizar sequence
SELECT setval('tb_user_id_seq', GREATEST(COALESCE((SELECT MAX(id) FROM tb_user), 0), 102));

-- =====================================
-- FORNECEDORES E COMPRADORES DE TESTE
-- =====================================

-- Fornecedor FA (do usuário A)
-- NOTA: O campo email será adicionado posteriormente pelo script 012_add_email_to_participants.sql
INSERT INTO tb_fornecedor (id, nome, whatsapp, created_at, updated_at) VALUES
(100, 'Fornecedor A - Teste', '11900000001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    whatsapp = EXCLUDED.whatsapp,
    updated_at = CURRENT_TIMESTAMP;

-- Fornecedor FB (do usuário B)
INSERT INTO tb_fornecedor (id, nome, whatsapp, created_at, updated_at) VALUES
(101, 'Fornecedor B - Teste', '11900000002', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    whatsapp = EXCLUDED.whatsapp,
    updated_at = CURRENT_TIMESTAMP;

-- Comprador CA (do usuário A)
INSERT INTO tb_comprador (id, nome, whatsapp, created_at, updated_at) VALUES
(100, 'Comprador A - Teste', '11900000003', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    whatsapp = EXCLUDED.whatsapp,
    updated_at = CURRENT_TIMESTAMP;

-- Comprador CB (do usuário B)
INSERT INTO tb_comprador (id, nome, whatsapp, created_at, updated_at) VALUES
(101, 'Comprador B - Teste', '11900000004', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    whatsapp = EXCLUDED.whatsapp,
    updated_at = CURRENT_TIMESTAMP;

-- Comprador CC (do usuário C - apenas comprador)
INSERT INTO tb_comprador (id, nome, whatsapp, created_at, updated_at) VALUES
(102, 'Comprador C - Teste', '11900000005', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    whatsapp = EXCLUDED.whatsapp,
    updated_at = CURRENT_TIMESTAMP;

-- Sincronizar sequences
SELECT setval('tb_fornecedor_id_seq', GREATEST(COALESCE((SELECT MAX(id) FROM tb_fornecedor), 0), 101));
SELECT setval('tb_comprador_id_seq', GREATEST(COALESCE((SELECT MAX(id) FROM tb_comprador), 0), 102));

-- =====================================
-- RELACIONAMENTOS USUÁRIO-FORNECEDOR-COMPRADOR
-- =====================================

-- Usuário A -> Fornecedor FA e Comprador CA
INSERT INTO tb_user_fornecedor (user_id, fornecedor_id, created_at) VALUES
(100, 100, CURRENT_TIMESTAMP)
ON CONFLICT (user_id, fornecedor_id) DO NOTHING;

INSERT INTO tb_user_comprador (user_id, comprador_id, created_at) VALUES
(100, 100, CURRENT_TIMESTAMP)
ON CONFLICT (user_id, comprador_id) DO NOTHING;

-- Usuário B -> Fornecedor FB e Comprador CB
INSERT INTO tb_user_fornecedor (user_id, fornecedor_id, created_at) VALUES
(101, 101, CURRENT_TIMESTAMP)
ON CONFLICT (user_id, fornecedor_id) DO NOTHING;

INSERT INTO tb_user_comprador (user_id, comprador_id, created_at) VALUES
(101, 101, CURRENT_TIMESTAMP)
ON CONFLICT (user_id, comprador_id) DO NOTHING;

-- Usuário C -> Apenas Comprador CC
INSERT INTO tb_user_comprador (user_id, comprador_id, created_at) VALUES
(102, 102, CURRENT_TIMESTAMP)
ON CONFLICT (user_id, comprador_id) DO NOTHING;

-- =====================================
-- LOTES DE TESTE
-- =====================================

-- Lote L1: Fornecedor FA, disponível para compra por B/C
INSERT INTO tb_lote_residuo (id, nome, preco, quantidade, quantidade_vendida, localizacao, tipo_id, unidade_id, fornecedor_id, created_at, updated_at)
VALUES (
    1000,
    'L1 - PET Incolor Teste',
    1500.00,
    10.0,
    0,
    '-15.7894,-47.8822',
    (SELECT id FROM tb_tipo WHERE nome = 'Reciclável' LIMIT 1),
    (SELECT id FROM tb_unidade WHERE nome = 'Toneladas' LIMIT 1),
    100,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- Adicionar foto ao Lote L1
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    1000,
    pg_read_binary_file('/opt/dominio/seeds/img/garrafas_pet.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tb_fotos WHERE lote_residuo_id = 1000);

-- Lote L2: Fornecedor FB, disponível para compra por A/C
INSERT INTO tb_lote_residuo (id, nome, preco, quantidade, quantidade_vendida, localizacao, tipo_id, unidade_id, fornecedor_id, created_at, updated_at)
VALUES (
    1001,
    'L2 - Vidros Teste',
    800.00,
    5.0,
    0,
    '-15.7975,-47.8756',
    (SELECT id FROM tb_tipo WHERE nome = 'Reciclável' LIMIT 1),
    (SELECT id FROM tb_unidade WHERE nome = 'Toneladas' LIMIT 1),
    101,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- Adicionar foto ao Lote L2
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    1001,
    pg_read_binary_file('/opt/dominio/seeds/img/garrafas_cerveja_secas.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tb_fotos WHERE lote_residuo_id = 1001);

-- Lote L3: Fornecedor FA, JÁ VENDIDO para CB (comprador do usuário B)
INSERT INTO tb_lote_residuo (id, nome, preco, quantidade, quantidade_vendida, localizacao, tipo_id, unidade_id, fornecedor_id, created_at, updated_at)
VALUES (
    1002,
    'L3 - Plástico Misto Teste (VENDIDO)',
    1200.00,
    8.0,
    8.0,
    '-15.8321,-48.0556',
    (SELECT id FROM tb_tipo WHERE nome = 'Reciclável' LIMIT 1),
    (SELECT id FROM tb_unidade WHERE nome = 'Toneladas' LIMIT 1),
    100,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- Adicionar foto ao Lote L3
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    1002,
    pg_read_binary_file('/opt/dominio/seeds/img/latas_refrigerante_copos_plastico.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tb_fotos WHERE lote_residuo_id = 1002);

-- Lote L4: Fornecedor FB, JÁ VENDIDO para CA (comprador do usuário A)
INSERT INTO tb_lote_residuo (id, nome, preco, quantidade, quantidade_vendida, localizacao, tipo_id, unidade_id, fornecedor_id, created_at, updated_at)
VALUES (
    1003,
    'L4 - Papelão Teste (VENDIDO)',
    600.00,
    12.0,
    12.0,
    '-15.8250,-47.9667',
    (SELECT id FROM tb_tipo WHERE nome = 'Reciclável' LIMIT 1),
    (SELECT id FROM tb_unidade WHERE nome = 'Toneladas' LIMIT 1),
    101,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- Adicionar foto ao Lote L4
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    1003,
    pg_read_binary_file('/opt/dominio/seeds/img/latas_refrigerante_copos_plastico.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tb_fotos WHERE lote_residuo_id = 1003);

-- Lote L5: Fornecedor FA, disponível mas será usado para testar bloqueio de auto-compra por usuário A
INSERT INTO tb_lote_residuo (id, nome, preco, quantidade, quantidade_vendida, localizacao, tipo_id, unidade_id, fornecedor_id, created_at, updated_at)
VALUES (
    1004,
    'L5 - Alumínio Teste (Para teste auto-compra)',
    2000.00,
    6.0,
    0,
    '-15.8200,-48.0400',
    (SELECT id FROM tb_tipo WHERE nome = 'Reciclável' LIMIT 1),
    (SELECT id FROM tb_unidade WHERE nome = 'Toneladas' LIMIT 1),
    100,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- Adicionar foto ao Lote L5
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    1004,
    pg_read_binary_file('/opt/dominio/seeds/img/garrafas_agua_secas.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tb_fotos WHERE lote_residuo_id = 1004);

-- Sincronizar sequence
SELECT setval('tb_lote_residuo_id_seq', GREATEST(COALESCE((SELECT MAX(id) FROM tb_lote_residuo), 0), 1004));

-- =====================================
-- TRANSAÇÕES DE TESTE
-- =====================================

-- Transação para L3: FA vendeu para CB (quantidade total)
INSERT INTO tb_transacao (id, fornecedor_id, comprador_id, lote_residuo_id, quantidade, created_at, updated_at)
VALUES (
    1000,
    100,  -- FA
    101,  -- CB
    1002, -- L3
    8.0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- Transação para L4: FB vendeu para CA (quantidade total)
INSERT INTO tb_transacao (id, fornecedor_id, comprador_id, lote_residuo_id, quantidade, created_at, updated_at)
VALUES (
    1001,
    101,  -- FB
    100,  -- CA
    1003, -- L4
    12.0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- Sincronizar sequence
SELECT setval('tb_transacao_id_seq', GREATEST(COALESCE((SELECT MAX(id) FROM tb_transacao), 0), 1001));

-- =====================================
-- VALIDAÇÕES
-- =====================================

DO $$
DECLARE
    lotes_disponiveis INTEGER;
    lotes_vendidos INTEGER;
    usuarios_criados INTEGER;
BEGIN
    -- Validar lotes disponíveis
    SELECT COUNT(*) INTO lotes_disponiveis
    FROM tb_lote_residuo
    WHERE id IN (1000, 1001, 1004) AND quantidade_vendida = 0;
    
    IF lotes_disponiveis <> 3 THEN
        RAISE EXCEPTION 'Erro: Esperado 3 lotes disponíveis (L1, L2, L5), encontrado %', lotes_disponiveis;
    END IF;
    
    -- Validar lotes vendidos
    SELECT COUNT(*) INTO lotes_vendidos
    FROM tb_lote_residuo
    WHERE id IN (1002, 1003) AND quantidade_vendida = quantidade;
    
    IF lotes_vendidos <> 2 THEN
        RAISE EXCEPTION 'Erro: Esperado 2 lotes vendidos (L3, L4), encontrado %', lotes_vendidos;
    END IF;
    
    -- Validar usuários criados
    SELECT COUNT(*) INTO usuarios_criados
    FROM tb_user
    WHERE id IN (100, 101, 102);
    
    IF usuarios_criados <> 3 THEN
        RAISE EXCEPTION 'Erro: Esperado 3 usuários de teste, encontrado %', usuarios_criados;
    END IF;
    
    RAISE NOTICE 'Seed de cenários de teste concluído com sucesso:';
    RAISE NOTICE '  - 3 usuários criados (A, B, C)';
    RAISE NOTICE '  - 5 lotes criados (L1-L5)';
    RAISE NOTICE '  - 3 lotes disponíveis (L1, L2, L5)';
    RAISE NOTICE '  - 2 lotes vendidos (L3, L4)';
    RAISE NOTICE '  - 2 transações criadas';
END $$;
