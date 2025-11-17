-- app/db/init/migrations/modular/001_ddl_tb_tipo.sql

-- Tabela de tipos de resíduo
CREATE TABLE IF NOT EXISTS tb_tipo (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE
);

COMMENT ON TABLE tb_tipo IS 'Tipos de resíduos disponíveis no sistema';
COMMENT ON COLUMN tb_tipo.id IS 'Identificador único do tipo';
COMMENT ON COLUMN tb_tipo.nome IS 'Nome do tipo de resíduo (ex: Orgânico, Reciclável)';

-- Seed inline de tipos padrão
INSERT INTO tb_tipo (nome) VALUES
('Orgânico'),
('Reciclável'),
('Perigoso'),
('Eletrônico'),
('Hospitalar'),
('Construção')
ON CONFLICT (nome) DO NOTHING;
