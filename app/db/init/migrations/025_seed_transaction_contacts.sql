-- app/db/init/migrations/025_seed_transaction_contacts.sql

-- Seeds de contatos de teste para fornecedores (user1@dominio.com.br até user10@dominio.com.br)
-- Conforme REQ-GMAIL-006: Seeds de ambiente devem incluir contatos dominio.com.br

-- Atualizar fornecedor existente com ID 1
UPDATE tb_fornecedor
SET email = 'user1@dominio.com.br'
WHERE id = 1;

-- Inserir fornecedores adicionais para testes
INSERT INTO tb_fornecedor (nome, whatsapp, email, created_at, updated_at) 
VALUES 
('Fornecedor 2', '11988888888', 'user2@dominio.com.br', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Fornecedor 3', '11977777777', 'user3@dominio.com.br', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Fornecedor 4', '11966666666', 'user4@dominio.com.br', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Fornecedor 5', '11955555555', 'user5@dominio.com.br', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Fornecedor 6', '11944444444', 'user6@dominio.com.br', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Fornecedor 7', '11933333333', 'user7@dominio.com.br', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Fornecedor 8', '11922222222', 'user8@dominio.com.br', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Fornecedor 9', '11911111111', 'user9@dominio.com.br', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Fornecedor 10', '11900000000', 'user10@dominio.com.br', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Inserir compradores para testes
INSERT INTO tb_comprador (nome, whatsapp, email, created_at, updated_at) 
VALUES 
('Comprador 1', '21999999999', 'user1@dominio.com.br', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Comprador 2', '21988888888', 'user2@dominio.com.br', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Comprador 3', '21977777777', 'user3@dominio.com.br', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Comprador 4', '21966666666', 'user4@dominio.com.br', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Comprador 5', '21955555555', 'user5@dominio.com.br', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Comprador 6', '21944444444', 'user6@dominio.com.br', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Comprador 7', '21933333333', 'user7@dominio.com.br', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Comprador 8', '21922222222', 'user8@dominio.com.br', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Comprador 9', '21911111111', 'user9@dominio.com.br', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Comprador 10', '21900000000', 'user10@dominio.com.br', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
