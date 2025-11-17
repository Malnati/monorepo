-- app/db/init/migrations/012_add_email_to_participants.sql

-- Adicionar campo email a tb_fornecedor
ALTER TABLE tb_fornecedor
ADD COLUMN email VARCHAR(255);

-- Adicionar campo email a tb_comprador
ALTER TABLE tb_comprador
ADD COLUMN email VARCHAR(255);

-- Criar índice para performance em consultas por email
CREATE INDEX idx_fornecedor_email ON tb_fornecedor(email);
CREATE INDEX idx_comprador_email ON tb_comprador(email);

-- Adicionar constraint de validação de formato de email
ALTER TABLE tb_fornecedor
ADD CONSTRAINT chk_fornecedor_email_format 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');

ALTER TABLE tb_comprador
ADD CONSTRAINT chk_comprador_email_format 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');
