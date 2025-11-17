-- app/db/init/ddl/006_ddl_tb_fotos.sql

-- Tabela de fotos dos offers
CREATE TABLE IF NOT EXISTS tb_fotos (
    id SERIAL PRIMARY KEY,
    offer_id INT NOT NULL REFERENCES tb_offer(id) ON DELETE CASCADE,
    imagem BYTEA NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE tb_fotos IS 'Fotos associadas aos offers de resíduo';
COMMENT ON COLUMN tb_fotos.id IS 'Identificador único da foto';
COMMENT ON COLUMN tb_fotos.offer_id IS 'FK para tb_offer - offer associado';
COMMENT ON COLUMN tb_fotos.imagem IS 'Dados binários da imagem em formato BYTEA';
COMMENT ON COLUMN tb_fotos.created_at IS 'Data de upload da foto';
COMMENT ON COLUMN tb_fotos.updated_at IS 'Data da última atualização';
