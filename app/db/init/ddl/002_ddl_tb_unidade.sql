-- app/db/init/migrations/modular/002_ddl_tb_unidade.sql

-- Tabela de unidades de medida
CREATE TABLE IF NOT EXISTS tb_unidade (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE
);

COMMENT ON TABLE tb_unidade IS 'Unidades de medida para quantificação de resíduos';
COMMENT ON COLUMN tb_unidade.id IS 'Identificador único da unidade';
COMMENT ON COLUMN tb_unidade.nome IS 'Nome da unidade (ex: Toneladas, m2, kg)';

-- Seed inline de unidades padrão
INSERT INTO tb_unidade (nome) VALUES
('Toneladas'),
('m2')
ON CONFLICT (nome) DO NOTHING;
