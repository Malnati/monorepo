-- app/db/init/seeds/data/009_seed_offers.sql
-- Seed básico de offers com campos essenciais
-- NOTA: Campos geoespaciais serão adicionados posteriormente pelas migrations de geolocalização

-- =====================================
-- VALIDAÇÃO PRÉVIA
-- =====================================
DO $$
DECLARE
    fornecedor_count INTEGER;
    tipo_count INTEGER;
    unidade_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO fornecedor_count FROM tb_fornecedor;
    SELECT COUNT(*) INTO tipo_count FROM tb_tipo;
    SELECT COUNT(*) INTO unidade_count FROM tb_unidade;
    
    IF fornecedor_count < 1 THEN
        RAISE EXCEPTION 'Erro: Nenhum fornecedor encontrado';
    END IF;
    
    IF tipo_count < 1 THEN
        RAISE EXCEPTION 'Erro: Nenhum tipo encontrado';
    END IF;
    
    IF unidade_count < 1 THEN
        RAISE EXCEPTION 'Erro: Nenhuma unidade encontrada';
    END IF;
    
    RAISE NOTICE 'Validação: % fornecedores, % tipos, % unidades', fornecedor_count, tipo_count, unidade_count;
END $$;

-- =====================================
-- OFFERS DE PRODUTOS
-- =====================================

-- Offer 1: Produto Genérico A
WITH offer_insert AS (
    INSERT INTO tb_offer (
        title, 
        description, 
        location, 
        neighborhood, 
        address,
        preco, 
        quantidade, 
        quantidade_vendida, 
        tipo_id, 
        unidade_id, 
        fornecedor_id, 
        created_at, 
        updated_at
    )
    VALUES (
        'Produto Premium - Categoria A',
        'Produto de alta qualidade, ideal para comercialização. Material em excelente estado.',
        '-15.7894,-47.8822',
        'Asa Norte',
        'Shopping Conjunto Nacional, Asa Norte, Brasília - DF, 70710-100',
        1850.00,
        8.5,
        0,
        (SELECT id FROM tb_tipo WHERE nome = 'Reciclável'),
        (SELECT id FROM tb_unidade WHERE nome = 'Toneladas'),
        (SELECT id FROM tb_fornecedor WHERE nome = 'Cooperativa Recicla São Paulo'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id
)
INSERT INTO tb_fotos (offer_id, imagem, created_at, updated_at)
SELECT 
    offer_insert.id,
    pg_read_binary_file('/opt/dominio/seeds/img/garrafas_pet.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM offer_insert;

-- Offer 2: Produto Genérico B
WITH offer_insert AS (
    INSERT INTO tb_offer (
        title, 
        description, 
        location, 
        neighborhood, 
        address,
        preco, 
        quantidade, 
        quantidade_vendida, 
        tipo_id, 
        unidade_id, 
        fornecedor_id, 
        created_at, 
        updated_at
    )
    VALUES (
        'Produto Categoria B - Variedade',
        'Produto de qualidade intermediária, adequado para diversos usos.',
        '-15.7983,-47.8908',
        'Asa Sul',
        'Park Shopping, Asa Sul, Brasília - DF, 70390-900',
        2100.00,
        6.2,
        0,
        (SELECT id FROM tb_tipo WHERE nome = 'Reciclável'),
        (SELECT id FROM tb_unidade WHERE nome = 'Toneladas'),
        (SELECT id FROM tb_fornecedor WHERE nome = 'Eco Resíduos Ltda'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id
)
INSERT INTO tb_fotos (offer_id, imagem, created_at, updated_at)
SELECT 
    offer_insert.id,
    pg_read_binary_file('/opt/dominio/seeds/img/garrafas_cerveja_secas.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM offer_insert;

-- Offer 3: Produto Genérico C
WITH offer_insert AS (
    INSERT INTO tb_offer (
        title, 
        description, 
        location, 
        neighborhood, 
        address,
        preco, 
        quantidade, 
        quantidade_vendida, 
        tipo_id, 
        unidade_id, 
        fornecedor_id, 
        created_at, 
        updated_at
    )
    VALUES (
        'Produto Categoria C - Mix',
        'Mix de produtos diversos, adequado para comercialização em lote.',
        '-15.7892,-47.8753',
        'Asa Norte',
        'Universidade de Brasília, Asa Norte, Brasília - DF, 70910-900',
        1650.00,
        12.0,
        0,
        (SELECT id FROM tb_tipo WHERE nome = 'Reciclável'),
        (SELECT id FROM tb_unidade WHERE nome = 'Toneladas'),
        (SELECT id FROM tb_fornecedor WHERE nome = 'Reciclagem Verde'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id
)
INSERT INTO tb_fotos (offer_id, imagem, created_at, updated_at)
SELECT 
    offer_insert.id,
    pg_read_binary_file('/opt/dominio/seeds/img/latas_refrigerante_copos_plastico.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM offer_insert;

-- Log de conclusão
DO $$ BEGIN
    RAISE NOTICE 'Seed de offers concluído com sucesso';
END $$;
