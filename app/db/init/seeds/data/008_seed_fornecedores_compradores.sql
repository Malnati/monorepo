-- app/db/init/seeds/data/008_seed_fornecedores_compradores.sql
-- Seed de fornecedores e compradores com avatares para o protótipo

-- =====================================
-- FORNECEDORES
-- =====================================

-- Atualizar fornecedor padrão com avatar
UPDATE tb_fornecedor 
SET avatar = pg_read_binary_file('/opt/dominio/seeds/img/avatars1_1.jpg'),
    whatsapp = '11999999999',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 1 AND nome = 'Fornecedor Padrão';

-- Inserir fornecedores adicionais (se não existirem)
INSERT INTO tb_fornecedor (nome, whatsapp, created_at, updated_at)
SELECT 'Cooperativa Recicla São Paulo', '11987654321', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tb_fornecedor WHERE nome = 'Cooperativa Recicla São Paulo');

UPDATE tb_fornecedor 
SET avatar = pg_read_binary_file('/opt/dominio/seeds/img/avatars1_2.jpg'),
    whatsapp = '11987654321',
    updated_at = CURRENT_TIMESTAMP
WHERE nome = 'Cooperativa Recicla São Paulo';

INSERT INTO tb_fornecedor (nome, whatsapp, created_at, updated_at)
SELECT 'Eco Resíduos Ltda', '11976543210', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tb_fornecedor WHERE nome = 'Eco Resíduos Ltda');

UPDATE tb_fornecedor 
SET avatar = pg_read_binary_file('/opt/dominio/seeds/img/avatars1_3.jpg'),
    whatsapp = '11976543210',
    updated_at = CURRENT_TIMESTAMP
WHERE nome = 'Eco Resíduos Ltda';

INSERT INTO tb_fornecedor (nome, whatsapp, created_at, updated_at)
SELECT 'Reciclagem Verde', '11965432109', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tb_fornecedor WHERE nome = 'Reciclagem Verde');

UPDATE tb_fornecedor 
SET avatar = pg_read_binary_file('/opt/dominio/seeds/img/avatars1_4.jpg'),
    whatsapp = '11965432109',
    updated_at = CURRENT_TIMESTAMP
WHERE nome = 'Reciclagem Verde';

INSERT INTO tb_fornecedor (nome, whatsapp, created_at, updated_at)
SELECT 'Materiais Recicláveis SP', '11954321098', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tb_fornecedor WHERE nome = 'Materiais Recicláveis SP');

UPDATE tb_fornecedor 
SET avatar = pg_read_binary_file('/opt/dominio/seeds/img/avatars2_1.jpg'),
    whatsapp = '11954321098',
    updated_at = CURRENT_TIMESTAMP
WHERE nome = 'Materiais Recicláveis SP';

INSERT INTO tb_fornecedor (nome, whatsapp, created_at, updated_at)
SELECT 'Sustentabilidade Ambiental', '11943210987', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tb_fornecedor WHERE nome = 'Sustentabilidade Ambiental');

UPDATE tb_fornecedor 
SET avatar = pg_read_binary_file('/opt/dominio/seeds/img/avatars2_2.jpg'),
    whatsapp = '11943210987',
    updated_at = CURRENT_TIMESTAMP
WHERE nome = 'Sustentabilidade Ambiental';

-- =====================================
-- COMPRADORES
-- =====================================

-- Inserir comprador padrão
INSERT INTO tb_comprador (nome, whatsapp, created_at, updated_at)
SELECT 'Indústria de Reciclagem ABC', '11888888888', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tb_comprador WHERE nome = 'Indústria de Reciclagem ABC');

UPDATE tb_comprador 
SET avatar = pg_read_binary_file('/opt/dominio/seeds/img/avatars3_1.jpg'),
    whatsapp = '11888888888',
    updated_at = CURRENT_TIMESTAMP
WHERE nome = 'Indústria de Reciclagem ABC';

INSERT INTO tb_comprador (nome, whatsapp, created_at, updated_at)
SELECT 'Fábrica de Plásticos XYZ', '11777777777', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tb_comprador WHERE nome = 'Fábrica de Plásticos XYZ');

UPDATE tb_comprador 
SET avatar = pg_read_binary_file('/opt/dominio/seeds/img/avatars3_2.jpg'),
    whatsapp = '11777777777',
    updated_at = CURRENT_TIMESTAMP
WHERE nome = 'Fábrica de Plásticos XYZ';
