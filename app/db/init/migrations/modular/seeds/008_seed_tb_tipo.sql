-- app/db/init/migrations/modular/seeds/008_seed_tb_tipo.sql

-- Seed de tipos padrão de resíduos
INSERT INTO tb_tipo (nome) VALUES
('Orgânico'),
('Reciclável'),
('Perigoso'),
('Eletrônico'),
('Hospitalar'),
('Construção')
ON CONFLICT (nome) DO NOTHING;
