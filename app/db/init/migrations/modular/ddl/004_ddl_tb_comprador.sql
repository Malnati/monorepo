-- app/db/init/migrations/modular/004_ddl_tb_comprador.sql

-- Tabela de compradores de resíduos
CREATE TABLE IF NOT EXISTS tb_comprador (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(20),
    avatar BYTEA,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE tb_comprador IS 'Compradores de resíduos (adquirentes de ofertas)';
COMMENT ON COLUMN tb_comprador.id IS 'Identificador único do comprador';
COMMENT ON COLUMN tb_comprador.nome IS 'Nome do comprador';
COMMENT ON COLUMN tb_comprador.whatsapp IS 'Número de WhatsApp para contato';
COMMENT ON COLUMN tb_comprador.avatar IS 'Imagem de perfil do comprador (BYTEA)';
COMMENT ON COLUMN tb_comprador.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN tb_comprador.updated_at IS 'Data da última atualização';
