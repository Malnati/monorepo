-- app/db/init/migrations/022_add_approximate_location.sql
-- Adicionar campos de localização aproximada para privacidade

-- Adicionar colunas para localização aproximada (deslocada ~15km da real)
ALTER TABLE tb_lote_residuo
ADD COLUMN IF NOT EXISTS approx_location_geog geography(Point, 4326),
ADD COLUMN IF NOT EXISTS approx_location_raw VARCHAR(255),
ADD COLUMN IF NOT EXISTS approx_formatted_address VARCHAR(255),
ADD COLUMN IF NOT EXISTS approx_geocoding_accuracy VARCHAR(20),
ADD COLUMN IF NOT EXISTS approx_place_id VARCHAR(64),
ADD COLUMN IF NOT EXISTS approx_city_name VARCHAR(120),
ADD COLUMN IF NOT EXISTS approx_city_location_raw VARCHAR(255),
ADD COLUMN IF NOT EXISTS approx_city_location_geog geography(Point, 4326),
ADD COLUMN IF NOT EXISTS approx_neighborhood_name VARCHAR(120),
ADD COLUMN IF NOT EXISTS approx_neighborhood_location_raw VARCHAR(255),
ADD COLUMN IF NOT EXISTS approx_neighborhood_location_geog geography(Point, 4326);

-- Criar índices espaciais para consultas de localização aproximada
CREATE INDEX IF NOT EXISTS idx_lote_approx_location_geog 
ON tb_lote_residuo USING GIST(approx_location_geog);

CREATE INDEX IF NOT EXISTS idx_lote_approx_city_location_geog 
ON tb_lote_residuo USING GIST(approx_city_location_geog);

CREATE INDEX IF NOT EXISTS idx_lote_approx_neighborhood_location_geog 
ON tb_lote_residuo USING GIST(approx_neighborhood_location_geog);
