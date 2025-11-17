-- app/db/init/migrations/020_add_more_units.sql
-- Adicionar novas unidades de medida para resíduos

-- Inserir novas unidades de medida
INSERT INTO tb_unidade (nome) VALUES
    ('Quilogramas (kg)'),
    ('Gramas (g)'),
    ('Litros (L)'),
    ('Metros cúbicos (m³)'),
    ('Metros quadrados (m²)'),
    ('Unidades (un)'),
    ('Fardos'),
    ('Caixas')
ON CONFLICT (nome) DO NOTHING;
