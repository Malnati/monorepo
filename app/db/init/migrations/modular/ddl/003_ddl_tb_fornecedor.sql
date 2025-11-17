-- app/db/init/migrations/modular/ddl/003_ddl_tb_fornecedor.sql

-- Tabela de fornecedores de resíduos
CREATE TABLE IF NOT EXISTS tb_fornecedor (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(20),
    avatar BYTEA,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE tb_fornecedor IS 'Fornecedores de resíduos (vendedores de ofertas)';
COMMENT ON COLUMN tb_fornecedor.id IS 'Identificador único do fornecedor';
COMMENT ON COLUMN tb_fornecedor.nome IS 'Nome do fornecedor';
COMMENT ON COLUMN tb_fornecedor.whatsapp IS 'Número de WhatsApp para contato';
COMMENT ON COLUMN tb_fornecedor.avatar IS 'Imagem de perfil do fornecedor (BYTEA)';
COMMENT ON COLUMN tb_fornecedor.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN tb_fornecedor.updated_at IS 'Data da última atualização';
