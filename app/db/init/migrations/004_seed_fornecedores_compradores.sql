-- app/db/init/migrations/004_seed_fornecedores_compradores.sql
-- Seed de fornecedores e compradores com avatares para o protótipo

-- =====================================
-- FORNECEDORES
-- =====================================

-- Atualizar fornecedor padrão com avatar
-- NOTA: O campo email será adicionado posteriormente pelo script 012_add_email_to_participants.sql
UPDATE tb_fornecedor 
SET avatar = pg_read_binary_file('/opt/dominio/seeds/img/avatars1_1.jpg'),
    whatsapp = COALESCE(whatsapp, '11999999999')
WHERE id = 1 AND nome = 'Fornecedor Padrão';

-- Fornecedor 2: Cooperativa Recicla São Paulo
-- Atualizar fornecedor existente (criado no seed anterior) com avatar e whatsapp
UPDATE tb_fornecedor 
SET avatar = pg_read_binary_file('/opt/dominio/seeds/img/avatars1_2.jpg'),
    whatsapp = COALESCE(whatsapp, '11987654321'),
    updated_at = CURRENT_TIMESTAMP
WHERE nome = 'Cooperativa Recicla São Paulo';

-- Fornecedor 3: Eco Resíduos Ltda
UPDATE tb_fornecedor 
SET avatar = pg_read_binary_file('/opt/dominio/seeds/img/avatars1_3.jpg'),
    whatsapp = COALESCE(whatsapp, '11976543210'),
    updated_at = CURRENT_TIMESTAMP
WHERE nome = 'Eco Resíduos Ltda';

-- Fornecedor 4: Reciclagem Verde
UPDATE tb_fornecedor 
SET avatar = pg_read_binary_file('/opt/dominio/seeds/img/avatars1_4.jpg'),
    whatsapp = COALESCE(whatsapp, '11965432109'),
    updated_at = CURRENT_TIMESTAMP
WHERE nome = 'Reciclagem Verde';

-- Fornecedor 5: Materiais Recicláveis SP
UPDATE tb_fornecedor 
SET avatar = pg_read_binary_file('/opt/dominio/seeds/img/avatars2_1.jpg'),
    whatsapp = COALESCE(whatsapp, '11954321098'),
    updated_at = CURRENT_TIMESTAMP
WHERE nome = 'Materiais Recicláveis SP';

-- Fornecedor 6: Sustentabilidade Ambiental
UPDATE tb_fornecedor 
SET avatar = pg_read_binary_file('/opt/dominio/seeds/img/avatars2_2.jpg'),
    whatsapp = COALESCE(whatsapp, '11943210987'),
    updated_at = CURRENT_TIMESTAMP
WHERE nome = 'Sustentabilidade Ambiental';

-- Fornecedor 7: Recicla Fácil
INSERT INTO tb_fornecedor (nome, whatsapp, avatar, created_at, updated_at)
SELECT 
    'Recicla Fácil',
    '11932109876',
    pg_read_binary_file('/opt/dominio/seeds/img/avatars2_3.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tb_fornecedor WHERE nome = 'Recicla Fácil');

UPDATE tb_fornecedor 
SET whatsapp = '11932109876',
    avatar = pg_read_binary_file('/opt/dominio/seeds/img/avatars2_3.jpg'),
    updated_at = CURRENT_TIMESTAMP
WHERE nome = 'Recicla Fácil';

-- Fornecedor 8: Verde Vida Coleta
INSERT INTO tb_fornecedor (nome, whatsapp, avatar, created_at, updated_at)
SELECT 
    'Verde Vida Coleta',
    '11921098765',
    pg_read_binary_file('/opt/dominio/seeds/img/avatars2_4.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tb_fornecedor WHERE nome = 'Verde Vida Coleta');

UPDATE tb_fornecedor 
SET whatsapp = '11921098765',
    avatar = pg_read_binary_file('/opt/dominio/seeds/img/avatars2_4.jpg'),
    updated_at = CURRENT_TIMESTAMP
WHERE nome = 'Verde Vida Coleta';

-- Fornecedor 9: Resíduos Inteligentes
INSERT INTO tb_fornecedor (nome, whatsapp, avatar, created_at, updated_at)
SELECT 
    'Resíduos Inteligentes',
    '11910987654',
    pg_read_binary_file('/opt/dominio/seeds/img/avatars3_1.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tb_fornecedor WHERE nome = 'Resíduos Inteligentes');

UPDATE tb_fornecedor 
SET whatsapp = '11910987654',
    avatar = pg_read_binary_file('/opt/dominio/seeds/img/avatars3_1.jpg'),
    updated_at = CURRENT_TIMESTAMP
WHERE nome = 'Resíduos Inteligentes';

-- Fornecedor 10: Eco Coleta Brasil
INSERT INTO tb_fornecedor (nome, whatsapp, avatar, created_at, updated_at)
SELECT 
    'Eco Coleta Brasil',
    '11909876543',
    pg_read_binary_file('/opt/dominio/seeds/img/avatars3_2.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tb_fornecedor WHERE nome = 'Eco Coleta Brasil');

UPDATE tb_fornecedor 
SET whatsapp = '11909876543',
    avatar = pg_read_binary_file('/opt/dominio/seeds/img/avatars3_2.jpg'),
    updated_at = CURRENT_TIMESTAMP
WHERE nome = 'Eco Coleta Brasil';

-- =====================================
-- COMPRADORES
-- =====================================

-- Comprador 1: Indústria Reciclagem Nacional
-- NOTA: O campo email será adicionado posteriormente pelo script 012_add_email_to_participants.sql
INSERT INTO tb_comprador (nome, whatsapp, avatar, created_at, updated_at)
SELECT 
    'Indústria Reciclagem Nacional',
    '11876543210',
    pg_read_binary_file('/opt/dominio/seeds/img/avatars3_3.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tb_comprador WHERE nome = 'Indústria Reciclagem Nacional');

UPDATE tb_comprador 
SET whatsapp = '11876543210',
    avatar = pg_read_binary_file('/opt/dominio/seeds/img/avatars3_3.jpg'),
    updated_at = CURRENT_TIMESTAMP
WHERE nome = 'Indústria Reciclagem Nacional';

-- Comprador 2: Plásticos Renovados SA
INSERT INTO tb_comprador (nome, whatsapp, avatar, created_at, updated_at)
SELECT 
    'Plásticos Renovados SA',
    '11865432109',
    pg_read_binary_file('/opt/dominio/seeds/img/avatars3_4.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tb_comprador WHERE nome = 'Plásticos Renovados SA');

UPDATE tb_comprador 
SET whatsapp = '11865432109',
    avatar = pg_read_binary_file('/opt/dominio/seeds/img/avatars3_4.jpg'),
    updated_at = CURRENT_TIMESTAMP
WHERE nome = 'Plásticos Renovados SA';

-- Comprador 3: Metalúrgica Verde
INSERT INTO tb_comprador (nome, whatsapp, avatar, created_at, updated_at)
SELECT 
    'Metalúrgica Verde',
    '11854321098',
    pg_read_binary_file('/opt/dominio/seeds/img/avatars4_1.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tb_comprador WHERE nome = 'Metalúrgica Verde');

UPDATE tb_comprador 
SET whatsapp = '11854321098',
    avatar = pg_read_binary_file('/opt/dominio/seeds/img/avatars4_1.jpg'),
    updated_at = CURRENT_TIMESTAMP
WHERE nome = 'Metalúrgica Verde';

-- Comprador 4: Papel e Celulose Sustentável
INSERT INTO tb_comprador (nome, whatsapp, avatar, created_at, updated_at)
SELECT 
    'Papel e Celulose Sustentável',
    '11843210987',
    pg_read_binary_file('/opt/dominio/seeds/img/avatars4_2.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tb_comprador WHERE nome = 'Papel e Celulose Sustentável');

UPDATE tb_comprador 
SET whatsapp = '11843210987',
    avatar = pg_read_binary_file('/opt/dominio/seeds/img/avatars4_2.jpg'),
    updated_at = CURRENT_TIMESTAMP
WHERE nome = 'Papel e Celulose Sustentável';

-- Comprador 5: Vidros Reciclados Brasil
INSERT INTO tb_comprador (nome, whatsapp, avatar, created_at, updated_at)
SELECT 
    'Vidros Reciclados Brasil',
    '11832109876',
    pg_read_binary_file('/opt/dominio/seeds/img/avatars4_3.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tb_comprador WHERE nome = 'Vidros Reciclados Brasil');

UPDATE tb_comprador 
SET whatsapp = '11832109876',
    avatar = pg_read_binary_file('/opt/dominio/seeds/img/avatars4_3.jpg'),
    updated_at = CURRENT_TIMESTAMP
WHERE nome = 'Vidros Reciclados Brasil';

-- Comprador 6: Compostagem Orgânica
INSERT INTO tb_comprador (nome, whatsapp, avatar, created_at, updated_at)
SELECT 
    'Compostagem Orgânica',
    '11821098765',
    pg_read_binary_file('/opt/dominio/seeds/img/avatars4_4.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tb_comprador WHERE nome = 'Compostagem Orgânica');

UPDATE tb_comprador 
SET whatsapp = '11821098765',
    avatar = pg_read_binary_file('/opt/dominio/seeds/img/avatars4_4.jpg'),
    updated_at = CURRENT_TIMESTAMP
WHERE nome = 'Compostagem Orgânica';

-- Comprador 7: Eletrônicos Reutilizados
INSERT INTO tb_comprador (nome, whatsapp, avatar, created_at, updated_at)
SELECT 
    'Eletrônicos Reutilizados',
    '11810987654',
    pg_read_binary_file('/opt/dominio/seeds/img/avatars5_1.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tb_comprador WHERE nome = 'Eletrônicos Reutilizados');

UPDATE tb_comprador 
SET whatsapp = '11810987654',
    avatar = pg_read_binary_file('/opt/dominio/seeds/img/avatars5_1.jpg'),
    updated_at = CURRENT_TIMESTAMP
WHERE nome = 'Eletrônicos Reutilizados';

-- Comprador 8: Construção Sustentável
INSERT INTO tb_comprador (nome, whatsapp, avatar, created_at, updated_at)
SELECT 
    'Construção Sustentável',
    '11809876543',
    pg_read_binary_file('/opt/dominio/seeds/img/avatars5_2.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tb_comprador WHERE nome = 'Construção Sustentável');

UPDATE tb_comprador 
SET whatsapp = '11809876543',
    avatar = pg_read_binary_file('/opt/dominio/seeds/img/avatars5_2.jpg'),
    updated_at = CURRENT_TIMESTAMP
WHERE nome = 'Construção Sustentável';

-- Comprador 9: Transformação de Resíduos
INSERT INTO tb_comprador (nome, whatsapp, avatar, created_at, updated_at)
SELECT 
    'Transformação de Resíduos',
    '11798765432',
    pg_read_binary_file('/opt/dominio/seeds/img/avatars5_3.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tb_comprador WHERE nome = 'Transformação de Resíduos');

UPDATE tb_comprador 
SET whatsapp = '11798765432',
    avatar = pg_read_binary_file('/opt/dominio/seeds/img/avatars5_3.jpg'),
    updated_at = CURRENT_TIMESTAMP
WHERE nome = 'Transformação de Resíduos';

-- Comprador 10: Economia Circular Ltda
INSERT INTO tb_comprador (nome, whatsapp, avatar, created_at, updated_at)
SELECT 
    'Economia Circular Ltda',
    '11787654321',
    pg_read_binary_file('/opt/dominio/seeds/img/avatars5_4.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tb_comprador WHERE nome = 'Economia Circular Ltda');

UPDATE tb_comprador 
SET whatsapp = '11787654321',
    avatar = pg_read_binary_file('/opt/dominio/seeds/img/avatars5_4.jpg'),
    updated_at = CURRENT_TIMESTAMP
WHERE nome = 'Economia Circular Ltda';

