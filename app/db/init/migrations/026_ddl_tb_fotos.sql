-- app/db/init/migrations/026_ddl_tb_fotos.sql
-- Script idempotente: cria tabela apenas se não existir

-- Tabela de fotos dos lotes
CREATE TABLE IF NOT EXISTS tb_fotos (
    id SERIAL PRIMARY KEY,
    lote_residuo_id INT NOT NULL REFERENCES tb_lote_residuo(id) ON DELETE CASCADE,
    imagem BYTEA NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE tb_fotos IS 'Fotos associadas aos lotes de resíduo';
COMMENT ON COLUMN tb_fotos.id IS 'Identificador único da foto';
COMMENT ON COLUMN tb_fotos.lote_residuo_id IS 'FK para tb_lote_residuo (renomeada para offer_id na migration 026)';
COMMENT ON COLUMN tb_fotos.imagem IS 'Dados binários da imagem';
COMMENT ON COLUMN tb_fotos.created_at IS 'Data de criação';
COMMENT ON COLUMN tb_fotos.updated_at IS 'Data da última atualização';
