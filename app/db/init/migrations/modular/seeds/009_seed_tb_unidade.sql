-- app/db/init/migrations/modular/seeds/009_seed_tb_unidade.sql

-- Seed de unidades de medida padrão
INSERT INTO tb_unidade (nome) VALUES
('Toneladas'),
('m2'),
('kg'),
('Litros'),
('Unidades')
ON CONFLICT (nome) DO NOTHING;
