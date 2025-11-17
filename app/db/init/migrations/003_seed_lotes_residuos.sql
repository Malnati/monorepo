-- app/db/init/migrations/003_seed_lotes_residuos.sql
-- Seed de lotes de resíduos com imagens para o protótipo
--
-- ⚠️ DEPRECATED: This file is part of the legacy migration approach.
-- It creates data using tb_lote_residuo which is later renamed to tb_offer.
-- For new development, use the modular approach:
--   - DDL: app/db/init/ddl/005_ddl_tb_offer.sql
--   - Seeds: app/db/init/seeds/data/009_seed_offers.sql
-- Migration guide: docs/rup/99-anexos/MVP/DEPRECATION_NOTICE.md
--
-- ATUALIZAÇÃO (2025-11-16): Imagens atualizadas para usar nomes descritivos
--   - Migrado de: /opt/dominio/seeds/residuo_XXX.jpg
--   - Para: /opt/dominio/seeds/img/nome_descritivo.jpg
--   - Referência: docs/rup/99-anexos/MVP/offer-image-mapping.md
--   - Total de 36 referências de imagem atualizadas (23 primárias + 13 secundárias)
--
-- NOTA: Todos os lotes devem possuir valores completos:
--   - preco: Preço por unidade (R$ por tonelada ou m²)
--   - quantidade: Quantidade total disponível (em toneladas ou m²)
--   - quantidade_vendida: Quantidade já vendida (pode ser 0)
--   - unidade_id: Referência obrigatória à tabela tb_unidade (Toneladas ou m²)
--   - tipo_id: Referência obrigatória à tabela tb_tipo
--   - fornecedor_id: Referência obrigatória à tabela tb_fornecedor
--
-- Todos os 23 lotes abaixo possuem valores válidos e completos.

-- =====================================
-- FORNECEDORES ADICIONAIS
-- =====================================

-- Sincronizar a sequence do ID antes de inserir novos fornecedores
-- Isso garante que não haverá conflito com o "Fornecedor Padrão" (id=1) criado no schema
SELECT setval('tb_fornecedor_id_seq', COALESCE((SELECT MAX(id) FROM tb_fornecedor), 0));

-- Inserir fornecedores apenas se não existirem (usando NOT EXISTS para evitar duplicatas)
-- NOTA: O campo email será adicionado posteriormente pelo script 012_add_email_to_participants.sql
INSERT INTO tb_fornecedor (nome, whatsapp, created_at, updated_at)
SELECT 'Cooperativa Recicla São Paulo', '11987654321', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tb_fornecedor WHERE nome = 'Cooperativa Recicla São Paulo');

UPDATE tb_fornecedor 
SET whatsapp = '11987654321',
    updated_at = CURRENT_TIMESTAMP
WHERE nome = 'Cooperativa Recicla São Paulo';

INSERT INTO tb_fornecedor (nome, whatsapp, created_at, updated_at)
SELECT 'Eco Resíduos Ltda', '11976543210', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tb_fornecedor WHERE nome = 'Eco Resíduos Ltda');

UPDATE tb_fornecedor 
SET whatsapp = '11976543210',
    updated_at = CURRENT_TIMESTAMP
WHERE nome = 'Eco Resíduos Ltda';

INSERT INTO tb_fornecedor (nome, whatsapp, created_at, updated_at)
SELECT 'Reciclagem Verde', '11965432109', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tb_fornecedor WHERE nome = 'Reciclagem Verde');

UPDATE tb_fornecedor 
SET whatsapp = '11965432109',
    updated_at = CURRENT_TIMESTAMP
WHERE nome = 'Reciclagem Verde';

INSERT INTO tb_fornecedor (nome, whatsapp, created_at, updated_at)
SELECT 'Materiais Recicláveis SP', '11954321098', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tb_fornecedor WHERE nome = 'Materiais Recicláveis SP');

UPDATE tb_fornecedor 
SET whatsapp = '11954321098',
    updated_at = CURRENT_TIMESTAMP
WHERE nome = 'Materiais Recicláveis SP';

INSERT INTO tb_fornecedor (nome, whatsapp, created_at, updated_at)
SELECT 'Sustentabilidade Ambiental', '11943210987', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tb_fornecedor WHERE nome = 'Sustentabilidade Ambiental');

UPDATE tb_fornecedor 
SET whatsapp = '11943210987',
    updated_at = CURRENT_TIMESTAMP
WHERE nome = 'Sustentabilidade Ambiental';

-- =====================================
-- VALIDAÇÃO PRÉVIA: Verificar que fornecedores, tipos e unidades existem
-- =====================================
DO $$
DECLARE
    fornecedor_count INTEGER;
    tipo_count INTEGER;
    unidade_count INTEGER;
BEGIN
    -- Verificar fornecedores
    SELECT COUNT(*) INTO fornecedor_count
    FROM tb_fornecedor
    WHERE nome IN ('Cooperativa Recicla São Paulo', 'Eco Resíduos Ltda', 'Reciclagem Verde', 
                   'Materiais Recicláveis SP', 'Sustentabilidade Ambiental', 'Fornecedor Padrão');
    
    IF fornecedor_count < 6 THEN
        RAISE EXCEPTION 'Erro: Esperado 6 fornecedores, mas encontrado apenas %', fornecedor_count;
    END IF;
    
    -- Verificar tipos
    SELECT COUNT(*) INTO tipo_count
    FROM tb_tipo
    WHERE nome IN ('Reciclável', 'Orgânico', 'Eletrônico', 'Construção');
    
    IF tipo_count < 4 THEN
        RAISE EXCEPTION 'Erro: Esperado pelo menos 4 tipos, mas encontrado apenas %', tipo_count;
    END IF;
    
    -- Verificar unidades
    SELECT COUNT(*) INTO unidade_count
    FROM tb_unidade
    WHERE nome = 'Toneladas';
    
    IF unidade_count < 1 THEN
        RAISE EXCEPTION 'Erro: Unidade "Toneladas" não encontrada';
    END IF;
    
    RAISE NOTICE 'Validação prévia: % fornecedores, % tipos, % unidades encontrados', fornecedor_count, tipo_count, unidade_count;
END $$;

-- =====================================
-- LOTES DE RESÍDUOS RECICLÁVEIS
-- =====================================

-- Lote 1: Garrafas PET
-- Localização real: Shopping Conjunto Nacional, Asa Norte
-- Bairro aproximado: Asa Norte (centroide estimado)
-- Cidade: Brasília
WITH lote_insert AS (
    INSERT INTO tb_lote_residuo (nome, preco, quantidade, quantidade_vendida, localizacao, formatted_address, location_geog, geocoding_accuracy, neighborhood_name, neighborhood_location_raw, neighborhood_location_geog, city_name, city_location_raw, city_location_geog, tipo_id, unidade_id, fornecedor_id, created_at, updated_at)
    VALUES (
        'Garrafas PET Incolor - Lote Premium',
        1850.00,
        8.5,
        0,
        '-15.7894,-47.8822',
        'Shopping Conjunto Nacional, Asa Norte, Brasília - DF, 70710-100',
        ST_SetSRID(ST_MakePoint(-47.8822, -15.7894), 4326)::geography,
        'ROOFTOP',
        'Asa Norte',
        '-15.7850,-47.8850',
        ST_SetSRID(ST_MakePoint(-47.8850, -15.7850), 4326)::geography,
        'Brasília',
        '-15.7942,-47.8822',
        ST_SetSRID(ST_MakePoint(-47.8822, -15.7942), 4326)::geography,
        (SELECT id FROM tb_tipo WHERE nome = 'Reciclável'),
        (SELECT id FROM tb_unidade WHERE nome = 'Toneladas'),
        (SELECT id FROM tb_fornecedor WHERE nome = 'Cooperativa Recicla São Paulo'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id
)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_insert.id,
    pg_read_binary_file('/opt/dominio/seeds/img/garrafas_pet.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_insert;

-- Lote 2: Vidros
-- Localização real: Catedral de Brasília, Esplanada dos Ministérios
-- Bairro aproximado: Esplanada dos Ministérios (centroide estimado)
-- Cidade: Brasília
WITH lote_insert AS (
    INSERT INTO tb_lote_residuo (nome, preco, quantidade, quantidade_vendida, localizacao, formatted_address, location_geog, geocoding_accuracy, neighborhood_name, neighborhood_location_raw, neighborhood_location_geog, city_name, city_location_raw, city_location_geog, tipo_id, unidade_id, fornecedor_id, created_at, updated_at)
    VALUES (
        'Vidros Marrons - Garrafas de Cerveja',
        950.00,
        12.3,
        0,
        '-15.7975,-47.8756',
        'Catedral de Brasília, Esplanada dos Ministérios, Brasília - DF, 70040-000',
        ST_SetSRID(ST_MakePoint(-47.8756, -15.7975), 4326)::geography,
        'ROOFTOP',
        'Esplanada dos Ministérios',
        '-15.7980,-47.8750',
        ST_SetSRID(ST_MakePoint(-47.8750, -15.7980), 4326)::geography,
        'Brasília',
        '-15.7942,-47.8822',
        ST_SetSRID(ST_MakePoint(-47.8822, -15.7942), 4326)::geography,
        (SELECT id FROM tb_tipo WHERE nome = 'Reciclável'),
        (SELECT id FROM tb_unidade WHERE nome = 'Toneladas'),
        (SELECT id FROM tb_fornecedor WHERE nome = 'Eco Resíduos Ltda'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id
)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_insert.id,
    pg_read_binary_file('/opt/dominio/seeds/img/garrafas_cerveja_secas.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_insert;

-- Lote 3: Plásticos Mistos
-- Localização real: Feira de Taguatinga
-- Bairro aproximado: Taguatinga Centro (centroide estimado)
-- Cidade: Brasília
WITH lote_insert AS (
    INSERT INTO tb_lote_residuo (nome, preco, quantidade, quantidade_vendida, localizacao, formatted_address, location_geog, geocoding_accuracy, neighborhood_name, neighborhood_location_raw, neighborhood_location_geog, city_name, city_location_raw, city_location_geog, tipo_id, unidade_id, fornecedor_id, created_at, updated_at)
    VALUES (
        'Plásticos Mistos - Embalagens',
        1200.00,
        15.7,
        2.5,
        '-15.8321,-48.0556',
        'Feira de Taguatinga, Taguatinga, Brasília - DF, 72115-000',
        ST_SetSRID(ST_MakePoint(-48.0556, -15.8321), 4326)::geography,
        'ROOFTOP',
        'Taguatinga Centro',
        '-15.8350,-48.0580',
        ST_SetSRID(ST_MakePoint(-48.0580, -15.8350), 4326)::geography,
        'Brasília',
        '-15.7942,-47.8822',
        ST_SetSRID(ST_MakePoint(-47.8822, -15.7942), 4326)::geography,
        (SELECT id FROM tb_tipo WHERE nome = 'Reciclável'),
        (SELECT id FROM tb_unidade WHERE nome = 'Toneladas'),
        (SELECT id FROM tb_fornecedor WHERE nome = 'Reciclagem Verde'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id
)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_insert.id,
    pg_read_binary_file('/opt/dominio/seeds/img/latas_refrigerante_copos_plastico.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_insert;

WITH lote_3 AS (SELECT id FROM tb_lote_residuo WHERE nome = 'Plásticos Mistos - Embalagens' ORDER BY id DESC LIMIT 1)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_3.id,
    pg_read_binary_file('/opt/dominio/seeds/img/latas_refrigerante_copos_plastico.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_3;

-- Lote 4: Plástico Verde
-- Localização real: Centro Comercial do Guará
-- Bairro aproximado: Guará I (centroide estimado)
-- Cidade: Brasília
WITH lote_insert AS (
    INSERT INTO tb_lote_residuo (nome, preco, quantidade, quantidade_vendida, localizacao, formatted_address, location_geog, geocoding_accuracy, neighborhood_name, neighborhood_location_raw, neighborhood_location_geog, city_name, city_location_raw, city_location_geog, tipo_id, unidade_id, fornecedor_id, created_at, updated_at)
    VALUES (
        'Plástico Verde - Garrafas',
        1350.00,
        6.2,
        0,
        '-15.8250,-47.9667',
        'Centro Comercial do Guará, Guará, Brasília - DF, 71020-000',
        ST_SetSRID(ST_MakePoint(-47.9667, -15.8250), 4326)::geography,
        'ROOFTOP',
        'Guará I',
        '-15.8300,-47.9700',
        ST_SetSRID(ST_MakePoint(-47.9700, -15.8300), 4326)::geography,
        'Brasília',
        '-15.7942,-47.8822',
        ST_SetSRID(ST_MakePoint(-47.8822, -15.7942), 4326)::geography,
        (SELECT id FROM tb_tipo WHERE nome = 'Reciclável'),
        (SELECT id FROM tb_unidade WHERE nome = 'Toneladas'),
        (SELECT id FROM tb_fornecedor WHERE nome = 'Materiais Recicláveis SP'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id
)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_insert.id,
    pg_read_binary_file('/opt/dominio/seeds/img/garrafas_agua_secas.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_insert;

-- =====================================
-- LOTES DE RESÍDUOS ORGÂNICOS
-- =====================================

-- Lote 5: Resíduos Orgânicos
-- Localização real: Ceilândia
-- Bairro aproximado: Ceilândia Centro (centroide estimado)
-- Cidade: Brasília
WITH lote_insert AS (
    INSERT INTO tb_lote_residuo (nome, preco, quantidade, quantidade_vendida, localizacao, formatted_address, location_geog, geocoding_accuracy, neighborhood_name, neighborhood_location_raw, neighborhood_location_geog, city_name, city_location_raw, city_location_geog, tipo_id, unidade_id, fornecedor_id, created_at, updated_at)
    VALUES (
        'Resíduos Orgânicos - Compostagem',
        450.00,
        25.0,
        5.0,
        '-15.8145,-48.1048',
        'Feira Central de Ceilândia, Ceilândia, Brasília - DF, 72210-000',
        ST_SetSRID(ST_MakePoint(-48.1048, -15.8145), 4326)::geography,
        'ROOFTOP',
        'Ceilândia Centro',
        '-15.8180,-48.1100',
        ST_SetSRID(ST_MakePoint(-48.1100, -15.8180), 4326)::geography,
        'Brasília',
        '-15.7942,-47.8822',
        ST_SetSRID(ST_MakePoint(-47.8822, -15.7942), 4326)::geography,
        (SELECT id FROM tb_tipo WHERE nome = 'Orgânico'),
        (SELECT id FROM tb_unidade WHERE nome = 'Toneladas'),
        (SELECT id FROM tb_fornecedor WHERE nome = 'Sustentabilidade Ambiental'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id
)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_insert.id,
    pg_read_binary_file('/opt/dominio/seeds/img/restos_comida.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_insert;

WITH lote_5 AS (SELECT id FROM tb_lote_residuo WHERE nome = 'Resíduos Orgânicos - Compostagem' ORDER BY id DESC LIMIT 1)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_5.id,
    pg_read_binary_file('/opt/dominio/seeds/img/organico_ovos_bananas_legumes.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_5;

-- =====================================
-- LOTES DE RESÍDUOS ELETRÔNICOS
-- =====================================

-- Lote 6: Eletrônicos
WITH lote_insert AS (
    INSERT INTO tb_lote_residuo (nome, preco, quantidade, quantidade_vendida, localizacao, formatted_address, location_geog, geocoding_accuracy, tipo_id, unidade_id, fornecedor_id, created_at, updated_at)
    VALUES (
        'Equipamentos Eletrônicos - Computadores',
        3200.00,
        3.5,
        0,
        '-15.6339,-47.8178',
        'Centro de Sobradinho, Sobradinho, Brasília - DF, 73010-000',
        ST_SetSRID(ST_MakePoint(-47.8178, -15.6339), 4326)::geography,
        'ROOFTOP',
        (SELECT id FROM tb_tipo WHERE nome = 'Eletrônico'),
        (SELECT id FROM tb_unidade WHERE nome = 'Toneladas'),
        (SELECT id FROM tb_fornecedor WHERE nome = 'Eco Resíduos Ltda'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id
)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_insert.id,
    pg_read_binary_file('/opt/dominio/seeds/img/computadores_monitores.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_insert;

-- Lote 7: Eletrônicos - Celulares
WITH lote_insert AS (
    INSERT INTO tb_lote_residuo (nome, preco, quantidade, quantidade_vendida, localizacao, formatted_address, location_geog, geocoding_accuracy, tipo_id, unidade_id, fornecedor_id, created_at, updated_at)
    VALUES (
        'Celulares e Smartphones Usados',
        4500.00,
        0.8,
        0,
        '-15.6161,-47.6697',
        'Centro de Planaltina, Planaltina, Brasília - DF, 73340-000',
        ST_SetSRID(ST_MakePoint(-47.6697, -15.6161), 4326)::geography,
        'ROOFTOP',
        (SELECT id FROM tb_tipo WHERE nome = 'Eletrônico'),
        (SELECT id FROM tb_unidade WHERE nome = 'Toneladas'),
        (SELECT id FROM tb_fornecedor WHERE nome = 'Cooperativa Recicla São Paulo'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id
)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_insert.id,
    pg_read_binary_file('/opt/dominio/seeds/img/eletronicos.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_insert;

-- =====================================
-- LOTES DE RESÍDUOS DE CONSTRUÇÃO
-- =====================================

-- Lote 8: Entulho
WITH lote_insert AS (
    INSERT INTO tb_lote_residuo (nome, preco, quantidade, quantidade_vendida, localizacao, formatted_address, location_geog, geocoding_accuracy, tipo_id, unidade_id, fornecedor_id, created_at, updated_at)
    VALUES (
        'Entulho de Construção Civil',
        280.00,
        50.0,
        10.0,
        '-15.8544,-48.1439',
        'Centro de Santa Maria, Santa Maria, Brasília - DF, 72520-000',
        ST_SetSRID(ST_MakePoint(-48.1439, -15.8544), 4326)::geography,
        'ROOFTOP',
        (SELECT id FROM tb_tipo WHERE nome = 'Construção'),
        (SELECT id FROM tb_unidade WHERE nome = 'Toneladas'),
        (SELECT id FROM tb_fornecedor WHERE nome = 'Fornecedor Padrão'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id
)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_insert.id,
    pg_read_binary_file('/opt/dominio/seeds/img/entulho_tijolos_pedras.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_insert;

WITH lote_8 AS (SELECT id FROM tb_lote_residuo WHERE nome = 'Entulho de Construção Civil' ORDER BY id DESC LIMIT 1)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_8.id,
    pg_read_binary_file('/opt/dominio/seeds/img/entulho_tijolos_pedras.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_8;

-- Lote 9: Madeira de Construção
WITH lote_insert AS (
    INSERT INTO tb_lote_residuo (nome, preco, quantidade, quantidade_vendida, localizacao, formatted_address, location_geog, geocoding_accuracy, tipo_id, unidade_id, fornecedor_id, created_at, updated_at)
    VALUES (
        'Madeira de Demolição',
        550.00,
        18.5,
        3.2,
        '-16.0178,-48.0611',
        'Centro do Gama, Gama, Brasília - DF, 72405-000',
        ST_SetSRID(ST_MakePoint(-48.0611, -16.0178), 4326)::geography,
        'ROOFTOP',
        (SELECT id FROM tb_tipo WHERE nome = 'Construção'),
        (SELECT id FROM tb_unidade WHERE nome = 'Toneladas'),
        (SELECT id FROM tb_fornecedor WHERE nome = 'Materiais Recicláveis SP'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id
)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_insert.id,
    pg_read_binary_file('/opt/dominio/seeds/img/tijolos_cimento.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_insert;

-- =====================================
-- LOTES ADICIONAIS DE RECICLÁVEIS
-- =====================================

-- Lote 10: Papel e Papelão
WITH lote_insert AS (
    INSERT INTO tb_lote_residuo (nome, preco, quantidade, quantidade_vendida, localizacao, formatted_address, location_geog, geocoding_accuracy, tipo_id, unidade_id, fornecedor_id, created_at, updated_at)
    VALUES (
        'Papelão Ondulado',
        680.00,
        22.0,
        4.5,
        '-15.8719,-48.0906',
        'Feira de Samambaia, Samambaia, Brasília - DF, 72315-000',
        ST_SetSRID(ST_MakePoint(-48.0906, -15.8719), 4326)::geography,
        'ROOFTOP',
        (SELECT id FROM tb_tipo WHERE nome = 'Reciclável'),
        (SELECT id FROM tb_unidade WHERE nome = 'Toneladas'),
        (SELECT id FROM tb_fornecedor WHERE nome = 'Reciclagem Verde'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id
)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_insert.id,
    pg_read_binary_file('/opt/dominio/seeds/img/latas_tinta.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_insert;

WITH lote_10 AS (SELECT id FROM tb_lote_residuo WHERE nome = 'Papelão Ondulado' ORDER BY id DESC LIMIT 1)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_10.id,
    pg_read_binary_file('/opt/dominio/seeds/img/latas_tinta.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_10;

-- Lote 11: Metais
WITH lote_insert AS (
    INSERT INTO tb_lote_residuo (nome, preco, quantidade, quantidade_vendida, localizacao, formatted_address, location_geog, geocoding_accuracy, tipo_id, unidade_id, fornecedor_id, created_at, updated_at)
    VALUES (
        'Metais Ferrosos - Latas',
        2100.00,
        9.8,
        1.5,
        '-15.8407,-48.0492',
        'Shopping Águas Claras, Águas Claras, Brasília - DF, 71900-000',
        ST_SetSRID(ST_MakePoint(-48.0492, -15.8407), 4326)::geography,
        'ROOFTOP',
        (SELECT id FROM tb_tipo WHERE nome = 'Reciclável'),
        (SELECT id FROM tb_unidade WHERE nome = 'Toneladas'),
        (SELECT id FROM tb_fornecedor WHERE nome = 'Eco Resíduos Ltda'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id
)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_insert.id,
    pg_read_binary_file('/opt/dominio/seeds/img/lagoes_metal_vazios.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_insert;

WITH lote_11 AS (SELECT id FROM tb_lote_residuo WHERE nome = 'Metais Ferrosos - Latas' ORDER BY id DESC LIMIT 1)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_11.id,
    pg_read_binary_file('/opt/dominio/seeds/img/latoes_metal_velhos.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_11;

-- Lote 12: Plástico Transparente
WITH lote_insert AS (
    INSERT INTO tb_lote_residuo (nome, preco, quantidade, quantidade_vendida, localizacao, formatted_address, location_geog, geocoding_accuracy, tipo_id, unidade_id, fornecedor_id, created_at, updated_at)
    VALUES (
        'Plástico Transparente - PET',
        1950.00,
        11.5,
        0,
        '-15.7889,-47.8983',
        'Torre de TV de Brasília, Núcleo Bandeirante, Brasília - DF, 70070-000',
        ST_SetSRID(ST_MakePoint(-47.8983, -15.7889), 4326)::geography,
        'ROOFTOP',
        (SELECT id FROM tb_tipo WHERE nome = 'Reciclável'),
        (SELECT id FROM tb_unidade WHERE nome = 'Toneladas'),
        (SELECT id FROM tb_fornecedor WHERE nome = 'Cooperativa Recicla São Paulo'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id
)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_insert.id,
    pg_read_binary_file('/opt/dominio/seeds/img/garrafas_pet.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_insert;

WITH lote_12 AS (SELECT id FROM tb_lote_residuo WHERE nome = 'Plástico Transparente - PET' ORDER BY id DESC LIMIT 1)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_12.id,
    pg_read_binary_file('/opt/dominio/seeds/img/garrafas_pet.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_12;

-- Lote 13: Vidros Coloridos
WITH lote_insert AS (
    INSERT INTO tb_lote_residuo (nome, preco, quantidade, quantidade_vendida, localizacao, formatted_address, location_geog, geocoding_accuracy, tipo_id, unidade_id, fornecedor_id, created_at, updated_at)
    VALUES (
        'Vidros Coloridos - Variados',
        1100.00,
        14.2,
        2.0,
        '-15.7500,-47.8750',
        'Parque da Cidade Sarah Kubitschek, Asa Norte, Brasília - DF, 70000-000',
        ST_SetSRID(ST_MakePoint(-47.8750, -15.7500), 4326)::geography,
        'ROOFTOP',
        (SELECT id FROM tb_tipo WHERE nome = 'Reciclável'),
        (SELECT id FROM tb_unidade WHERE nome = 'Toneladas'),
        (SELECT id FROM tb_fornecedor WHERE nome = 'Sustentabilidade Ambiental'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id
)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_insert.id,
    pg_read_binary_file('/opt/dominio/seeds/img/garragas_vridro_varios_tamanhos.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_insert;

WITH lote_13 AS (SELECT id FROM tb_lote_residuo WHERE nome = 'Vidros Coloridos - Variados' ORDER BY id DESC LIMIT 1)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_13.id,
    pg_read_binary_file('/opt/dominio/seeds/img/potes_vidro_tampa_metal.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_13;

-- Lote 14: Plásticos Rígidos
WITH lote_insert AS (
    INSERT INTO tb_lote_residuo (nome, preco, quantidade, quantidade_vendida, localizacao, formatted_address, location_geog, geocoding_accuracy, tipo_id, unidade_id, fornecedor_id, created_at, updated_at)
    VALUES (
        'Plásticos Rígidos - PP e PEAD',
        1650.00,
        7.8,
        0,
        '-15.8000,-47.8900',
        'Congresso Nacional, Esplanada dos Ministérios, Brasília - DF, 70160-900',
        ST_SetSRID(ST_MakePoint(-47.8900, -15.8000), 4326)::geography,
        'ROOFTOP',
        (SELECT id FROM tb_tipo WHERE nome = 'Reciclável'),
        (SELECT id FROM tb_unidade WHERE nome = 'Toneladas'),
        (SELECT id FROM tb_fornecedor WHERE nome = 'Materiais Recicláveis SP'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id
)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_insert.id,
    pg_read_binary_file('/opt/dominio/seeds/img/latas_refrigerante_copos_plastico.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_insert;

WITH lote_14 AS (SELECT id FROM tb_lote_residuo WHERE nome = 'Plásticos Rígidos - PP e PEAD' ORDER BY id DESC LIMIT 1)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_14.id,
    pg_read_binary_file('/opt/dominio/seeds/img/plasticos_seringas_tampas.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_14;

-- Lote 15: Alumínio
WITH lote_insert AS (
    INSERT INTO tb_lote_residuo (nome, preco, quantidade, quantidade_vendida, localizacao, formatted_address, location_geog, geocoding_accuracy, tipo_id, unidade_id, fornecedor_id, created_at, updated_at)
    VALUES (
        'Alumínio - Latas e Sucatas',
        3800.00,
        5.5,
        1.8,
        '-15.8200,-48.0400',
        'Centro de Taguatinga, Taguatinga, Brasília - DF, 72115-000',
        ST_SetSRID(ST_MakePoint(-48.0400, -15.8200), 4326)::geography,
        'ROOFTOP',
        (SELECT id FROM tb_tipo WHERE nome = 'Reciclável'),
        (SELECT id FROM tb_unidade WHERE nome = 'Toneladas'),
        (SELECT id FROM tb_fornecedor WHERE nome = 'Reciclagem Verde'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id
)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_insert.id,
    pg_read_binary_file('/opt/dominio/seeds/img/lagoes_metal_vazios.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_insert;

WITH lote_15 AS (SELECT id FROM tb_lote_residuo WHERE nome = 'Alumínio - Latas e Sucatas' ORDER BY id DESC LIMIT 1)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_15.id,
    pg_read_binary_file('/opt/dominio/seeds/img/lagoes_metal_vazios.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_15;

-- Lote 16: Plástico Filme
WITH lote_insert AS (
    INSERT INTO tb_lote_residuo (nome, preco, quantidade, quantidade_vendida, localizacao, formatted_address, location_geog, geocoding_accuracy, tipo_id, unidade_id, fornecedor_id, created_at, updated_at)
    VALUES (
        'Plástico Filme - PEBD',
        1250.00,
        13.5,
        0,
        '-15.8300,-47.9500',
        'Centro Comercial do Guará, Guará, Brasília - DF, 71020-000',
        ST_SetSRID(ST_MakePoint(-47.9500, -15.8300), 4326)::geography,
        'ROOFTOP',
        (SELECT id FROM tb_tipo WHERE nome = 'Reciclável'),
        (SELECT id FROM tb_unidade WHERE nome = 'Toneladas'),
        (SELECT id FROM tb_fornecedor WHERE nome = 'Eco Resíduos Ltda'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id
)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_insert.id,
    pg_read_binary_file('/opt/dominio/seeds/img/plasticos_seringas_tampas.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_insert;

WITH lote_16 AS (SELECT id FROM tb_lote_residuo WHERE nome = 'Plástico Filme - PEBD' ORDER BY id DESC LIMIT 1)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_16.id,
    pg_read_binary_file('/opt/dominio/seeds/img/plasticos_seringas_tampas.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_16;

-- Lote 17: Papel Misto
WITH lote_insert AS (
    INSERT INTO tb_lote_residuo (nome, preco, quantidade, quantidade_vendida, localizacao, formatted_address, location_geog, geocoding_accuracy, tipo_id, unidade_id, fornecedor_id, created_at, updated_at)
    VALUES (
        'Papel Misto - Escritórios',
        720.00,
        19.3,
        3.0,
        '-15.8200,-48.1100',
        'Feira Central de Ceilândia, Ceilândia, Brasília - DF, 72210-000',
        ST_SetSRID(ST_MakePoint(-48.1100, -15.8200), 4326)::geography,
        'ROOFTOP',
        (SELECT id FROM tb_tipo WHERE nome = 'Reciclável'),
        (SELECT id FROM tb_unidade WHERE nome = 'Toneladas'),
        (SELECT id FROM tb_fornecedor WHERE nome = 'Cooperativa Recicla São Paulo'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id
)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_insert.id,
    pg_read_binary_file('/opt/dominio/seeds/img/latas_tinta.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_insert;

-- Lote 18: Vidros Planos
WITH lote_insert AS (
    INSERT INTO tb_lote_residuo (nome, preco, quantidade, quantidade_vendida, localizacao, formatted_address, location_geog, geocoding_accuracy, tipo_id, unidade_id, fornecedor_id, created_at, updated_at)
    VALUES (
        'Vidros Planos - Janelas',
        980.00,
        8.7,
        0,
        '-15.6400,-47.8300',
        'Centro de Sobradinho, Sobradinho, Brasília - DF, 73010-000',
        ST_SetSRID(ST_MakePoint(-47.8300, -15.6400), 4326)::geography,
        'ROOFTOP',
        (SELECT id FROM tb_tipo WHERE nome = 'Reciclável'),
        (SELECT id FROM tb_unidade WHERE nome = 'Toneladas'),
        (SELECT id FROM tb_fornecedor WHERE nome = 'Sustentabilidade Ambiental'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id
)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_insert.id,
    pg_read_binary_file('/opt/dominio/seeds/img/garragas_vridro_varios_tamanhos.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_insert;

WITH lote_18 AS (SELECT id FROM tb_lote_residuo WHERE nome = 'Vidros Planos - Janelas' ORDER BY id DESC LIMIT 1)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_18.id,
    pg_read_binary_file('/opt/dominio/seeds/img/potes_vidro_tampa_metal.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_18;

-- Lote 19: Plástico EPS (Isopor)
WITH lote_insert AS (
    INSERT INTO tb_lote_residuo (nome, preco, quantidade, quantidade_vendida, localizacao, formatted_address, location_geog, geocoding_accuracy, tipo_id, unidade_id, fornecedor_id, created_at, updated_at)
    VALUES (
        'Isopor - EPS',
        850.00,
        4.2,
        0,
        '-15.6200,-47.6800',
        'Centro de Planaltina, Planaltina, Brasília - DF, 73340-000',
        ST_SetSRID(ST_MakePoint(-47.6800, -15.6200), 4326)::geography,
        'ROOFTOP',
        (SELECT id FROM tb_tipo WHERE nome = 'Reciclável'),
        (SELECT id FROM tb_unidade WHERE nome = 'Toneladas'),
        (SELECT id FROM tb_fornecedor WHERE nome = 'Materiais Recicláveis SP'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id
)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_insert.id,
    pg_read_binary_file('/opt/dominio/seeds/img/tampilhas_plastico.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_insert;

-- Lote 20: Resíduos Orgânicos - Restos de Comida
WITH lote_insert AS (
    INSERT INTO tb_lote_residuo (nome, preco, quantidade, quantidade_vendida, localizacao, formatted_address, location_geog, geocoding_accuracy, tipo_id, unidade_id, fornecedor_id, created_at, updated_at)
    VALUES (
        'Restos de Comida - Orgânicos',
        380.00,
        30.0,
        8.5,
        '-15.8600,-48.1500',
        'Centro de Santa Maria, Santa Maria, Brasília - DF, 72520-000',
        ST_SetSRID(ST_MakePoint(-48.1500, -15.8600), 4326)::geography,
        'ROOFTOP',
        (SELECT id FROM tb_tipo WHERE nome = 'Orgânico'),
        (SELECT id FROM tb_unidade WHERE nome = 'Toneladas'),
        (SELECT id FROM tb_fornecedor WHERE nome = 'Sustentabilidade Ambiental'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id
)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_insert.id,
    pg_read_binary_file('/opt/dominio/seeds/img/restos_comida.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_insert;

WITH lote_20 AS (SELECT id FROM tb_lote_residuo WHERE nome = 'Restos de Comida - Orgânicos' ORDER BY id DESC LIMIT 1)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_20.id,
    pg_read_binary_file('/opt/dominio/seeds/img/organico_ovos_bananas_legumes.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_20;

-- Lote 21: Eletrônicos - Monitores
WITH lote_insert AS (
    INSERT INTO tb_lote_residuo (nome, preco, quantidade, quantidade_vendida, localizacao, formatted_address, location_geog, geocoding_accuracy, tipo_id, unidade_id, fornecedor_id, created_at, updated_at)
    VALUES (
        'Monitores e TVs Usadas',
        2800.00,
        2.5,
        0,
        '-16.0200,-48.0700',
        'Centro do Gama, Gama, Brasília - DF, 72405-000',
        ST_SetSRID(ST_MakePoint(-48.0700, -16.0200), 4326)::geography,
        'ROOFTOP',
        (SELECT id FROM tb_tipo WHERE nome = 'Eletrônico'),
        (SELECT id FROM tb_unidade WHERE nome = 'Toneladas'),
        (SELECT id FROM tb_fornecedor WHERE nome = 'Eco Resíduos Ltda'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id
)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_insert.id,
    pg_read_binary_file('/opt/dominio/seeds/img/computadores_monitores.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_insert;

-- Lote 22: Construção - Tijolos
WITH lote_insert AS (
    INSERT INTO tb_lote_residuo (nome, preco, quantidade, quantidade_vendida, localizacao, formatted_address, location_geog, geocoding_accuracy, tipo_id, unidade_id, fornecedor_id, created_at, updated_at)
    VALUES (
        'Tijolos e Telhas',
        320.00,
        35.0,
        12.0,
        '-15.8800,-48.1000',
        'Feira de Samambaia, Samambaia, Brasília - DF, 72315-000',
        ST_SetSRID(ST_MakePoint(-48.1000, -15.8800), 4326)::geography,
        'ROOFTOP',
        (SELECT id FROM tb_tipo WHERE nome = 'Construção'),
        (SELECT id FROM tb_unidade WHERE nome = 'Toneladas'),
        (SELECT id FROM tb_fornecedor WHERE nome = 'Fornecedor Padrão'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id
)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_insert.id,
    pg_read_binary_file('/opt/dominio/seeds/img/tijolos_cimento.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_insert;

WITH lote_22 AS (SELECT id FROM tb_lote_residuo WHERE nome = 'Tijolos e Telhas' ORDER BY id DESC LIMIT 1)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_22.id,
    pg_read_binary_file('/opt/dominio/seeds/img/cascas_batata_laraja_ovos.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_22;

-- Lote 23: Resíduos Orgânicos - Folhas
WITH lote_insert AS (
    INSERT INTO tb_lote_residuo (nome, preco, quantidade, quantidade_vendida, localizacao, formatted_address, location_geog, geocoding_accuracy, tipo_id, unidade_id, fornecedor_id, created_at, updated_at)
    VALUES (
        'Folhas e Galhos - Podas',
        420.00,
        28.5,
        6.2,
        '-15.8450,-48.0550',
        'Shopping Águas Claras, Águas Claras, Brasília - DF, 71900-000',
        ST_SetSRID(ST_MakePoint(-48.0550, -15.8450), 4326)::geography,
        'ROOFTOP',
        (SELECT id FROM tb_tipo WHERE nome = 'Orgânico'),
        (SELECT id FROM tb_unidade WHERE nome = 'Toneladas'),
        (SELECT id FROM tb_fornecedor WHERE nome = 'Reciclagem Verde'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id
)
INSERT INTO tb_fotos (lote_residuo_id, imagem, created_at, updated_at)
SELECT 
    lote_insert.id,
    pg_read_binary_file('/opt/dominio/seeds/img/frutas_legumes_verdutas.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lote_insert;

-- =====================================
-- VALIDAÇÃO DE INTEGRIDADE DOS DADOS
-- =====================================
-- Verificar que todos os lotes possuem valores completos
-- (Esta query deve retornar zero registros se todos estiverem completos)

DO $$
DECLARE
    lotes_incompletos INTEGER;
    lote_info RECORD;
BEGIN
    -- Primeiro, identificar quais lotes estão incompletos
    FOR lote_info IN 
        SELECT id, nome, 
               CASE WHEN preco IS NULL THEN 'preco NULL' ELSE '' END ||
               CASE WHEN quantidade IS NULL THEN ', quantidade NULL' ELSE '' END ||
               CASE WHEN quantidade < 0 THEN ', quantidade < 0' ELSE '' END ||
               CASE WHEN unidade_id IS NULL THEN ', unidade_id NULL' ELSE '' END ||
               CASE WHEN tipo_id IS NULL THEN ', tipo_id NULL' ELSE '' END ||
               CASE WHEN fornecedor_id IS NULL THEN ', fornecedor_id NULL' ELSE '' END AS problemas
        FROM tb_lote_residuo
        WHERE preco IS NULL 
           OR quantidade IS NULL 
           OR quantidade < 0
           OR unidade_id IS NULL
           OR tipo_id IS NULL
           OR fornecedor_id IS NULL
    LOOP
        RAISE NOTICE 'Lote incompleto - ID: %, Nome: %, Problemas: %', lote_info.id, lote_info.nome, lote_info.problemas;
    END LOOP;
    
    SELECT COUNT(*) INTO lotes_incompletos
    FROM tb_lote_residuo
    WHERE preco IS NULL 
       OR quantidade IS NULL 
       OR quantidade < 0
       OR unidade_id IS NULL
       OR tipo_id IS NULL
       OR fornecedor_id IS NULL;
    
    IF lotes_incompletos > 0 THEN
        RAISE EXCEPTION 'Erro: % lotes encontrados com valores incompletos (preco, quantidade, unidade_id, tipo_id ou fornecedor_id NULL ou inválidos). Verifique os NOTICE acima para detalhes.', lotes_incompletos;
    END IF;
    
    RAISE NOTICE 'Validação concluída: Todos os lotes possuem valores completos (preco, quantidade, unidade_id, tipo_id e fornecedor_id preenchidos)';
END $$;
