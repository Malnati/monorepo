-- app/db/init/migrations/modular/seeds/012_seed_tb_offer.sql

-- Seed de offers de teste para desenvolvimento e demonstração
-- Referência: docs/rup/99-anexos/MVP/offer-image-mapping.md

-- Offer 1: Garrafas PET Incolor Premium
INSERT INTO tb_offer (
    title, description, preco, quantidade, quantidade_vendida,
    location, neighborhood, address,
    tipo_id, unidade_id, fornecedor_id,
    created_at, updated_at
) VALUES (
    'Garrafas PET Incolor Premium',
    'Lote de garrafas PET incolor de alta qualidade, ideais para reciclagem. Material limpo e separado.',
    150.00, 500.00, 0.00,
    '-15.7894,-47.8822', 'Asa Sul', 'Brasília - DF',
    (SELECT id FROM tb_tipo WHERE nome = 'Reciclável' LIMIT 1),
    (SELECT id FROM tb_unidade WHERE nome = 'kg' LIMIT 1),
    1,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
) ON CONFLICT DO NOTHING;

-- Offer 2: Vidros Marrons de Cerveja
INSERT INTO tb_offer (
    title, description, preco, quantidade, quantidade_vendida,
    location, neighborhood, address,
    tipo_id, unidade_id, fornecedor_id,
    created_at, updated_at
) VALUES (
    'Vidros Marrons de Cerveja',
    'Garrafas de cerveja marrons limpas e secas. Excelente para reciclagem de vidro.',
    200.00, 300.00, 0.00,
    '-15.7894,-47.8822', 'Asa Norte', 'Brasília - DF',
    (SELECT id FROM tb_tipo WHERE nome = 'Reciclável' LIMIT 1),
    (SELECT id FROM tb_unidade WHERE nome = 'kg' LIMIT 1),
    1,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
) ON CONFLICT DO NOTHING;

-- Offer 3: Plásticos Mistos de Embalagens
INSERT INTO tb_offer (
    title, description, preco, quantidade, quantidade_vendida,
    location, neighborhood, address,
    tipo_id, unidade_id, fornecedor_id,
    created_at, updated_at
) VALUES (
    'Plásticos Mistos de Embalagens',
    'Diversos tipos de plásticos de embalagens, incluindo PEAD e PEBD. Material triado.',
    180.00, 450.00, 0.00,
    '-15.7950,-47.8900', 'Lago Sul', 'Brasília - DF',
    (SELECT id FROM tb_tipo WHERE nome = 'Reciclável' LIMIT 1),
    (SELECT id FROM tb_unidade WHERE nome = 'kg' LIMIT 1),
    1,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
) ON CONFLICT DO NOTHING;

-- Offer 4: Papelão Ondulado Industrial
INSERT INTO tb_offer (
    title, description, preco, quantidade, quantidade_vendida,
    location, neighborhood, address,
    tipo_id, unidade_id, fornecedor_id,
    created_at, updated_at
) VALUES (
    'Papelão Ondulado Industrial',
    'Papelão ondulado de caixas industriais. Material limpo e pronto para reciclagem.',
    120.00, 800.00, 0.00,
    '-15.8000,-47.8700', 'Taguatinga', 'Brasília - DF',
    (SELECT id FROM tb_tipo WHERE nome = 'Reciclável' LIMIT 1),
    (SELECT id FROM tb_unidade WHERE nome = 'kg' LIMIT 1),
    1,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
) ON CONFLICT DO NOTHING;

-- Offer 5: Latas de Alumínio
INSERT INTO tb_offer (
    title, description, preco, quantidade, quantidade_vendida,
    location, neighborhood, address,
    tipo_id, unidade_id, fornecedor_id,
    created_at, updated_at
) VALUES (
    'Latas de Alumínio',
    'Latas de alumínio de refrigerantes e cervejas, compactadas e limpas.',
    350.00, 250.00, 0.00,
    '-15.7900,-47.8800', 'Asa Sul', 'Brasília - DF',
    (SELECT id FROM tb_tipo WHERE nome = 'Reciclável' LIMIT 1),
    (SELECT id FROM tb_unidade WHERE nome = 'kg' LIMIT 1),
    1,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
) ON CONFLICT DO NOTHING;
