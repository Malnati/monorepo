-- app/db/init/migrations/026_add_email_to_participants.sql
-- Script idempotente: adiciona email apenas se não existir

-- Adicionar campo email a tb_fornecedor
ALTER TABLE tb_fornecedor
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Adicionar campo email a tb_comprador
ALTER TABLE tb_comprador
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Criar índice para performance em consultas por email (idempotente)
CREATE INDEX IF NOT EXISTS idx_fornecedor_email ON tb_fornecedor(email);
CREATE INDEX IF NOT EXISTS idx_comprador_email ON tb_comprador(email);

-- Adicionar constraint de validação de formato de email (idempotente)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_fornecedor_email_format'
    ) THEN
        ALTER TABLE tb_fornecedor
        ADD CONSTRAINT chk_fornecedor_email_format 
        CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_comprador_email_format'
    ) THEN
        ALTER TABLE tb_comprador
        ADD CONSTRAINT chk_comprador_email_format 
        CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');
    END IF;
END $$;
