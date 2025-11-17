-- app/db/init/migrations/002_add_geospatial_fields.sql

-- Habilitar extensão PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Adicionar campos geoespaciais (preservando localizacao VARCHAR existente)
ALTER TABLE tb_lote_residuo
  ADD COLUMN IF NOT EXISTS location_geog GEOGRAPHY(POINT, 4326),
  ADD COLUMN IF NOT EXISTS formatted_address VARCHAR(255),
  ADD COLUMN IF NOT EXISTS place_id VARCHAR(64),
  ADD COLUMN IF NOT EXISTS geocoding_accuracy VARCHAR(20) CHECK (
    geocoding_accuracy IN ('ROOFTOP', 'RANGE_INTERPOLATED', 'GEOMETRIC_CENTER', 'APPROXIMATE')
  ),
  -- Campos de localização da cidade
  ADD COLUMN IF NOT EXISTS city_name VARCHAR(120),
  ADD COLUMN IF NOT EXISTS city_location_raw VARCHAR(255),
  ADD COLUMN IF NOT EXISTS city_location_geog GEOGRAPHY(POINT, 4326),
  -- Campos de localização do bairro
  ADD COLUMN IF NOT EXISTS neighborhood_name VARCHAR(120),
  ADD COLUMN IF NOT EXISTS neighborhood_location_raw VARCHAR(255),
  ADD COLUMN IF NOT EXISTS neighborhood_location_geog GEOGRAPHY(POINT, 4326);

-- Criar índice espacial GIST para performance em queries de proximidade
CREATE INDEX IF NOT EXISTS idx_tb_lote_residuo_location_geog 
ON tb_lote_residuo USING GIST (location_geog)
WHERE location_geog IS NOT NULL;

-- Criar índice para busca por place_id
CREATE INDEX IF NOT EXISTS idx_tb_lote_residuo_place_id 
ON tb_lote_residuo (place_id)
WHERE place_id IS NOT NULL;

-- Criar índices espaciais GIST para city_location_geog e neighborhood_location_geog
CREATE INDEX IF NOT EXISTS idx_tb_lote_residuo_city_location_geog 
ON tb_lote_residuo USING GIST (city_location_geog)
WHERE city_location_geog IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tb_lote_residuo_neighborhood_location_geog 
ON tb_lote_residuo USING GIST (neighborhood_location_geog)
WHERE neighborhood_location_geog IS NOT NULL;

-- Função para popular location_geog a partir de latitude/longitude (se necessário)
CREATE OR REPLACE FUNCTION fn_update_location_geog()
RETURNS TRIGGER AS $$
DECLARE
  coords text[];
  lat numeric;
  lng numeric;
BEGIN
  -- Se formatted_address e coordenadas foram fornecidos, criar o ponto geográfico
  IF NEW.formatted_address IS NOT NULL AND 
     NEW.location_geog IS NULL AND
     NEW.localizacao IS NOT NULL AND 
     NEW.localizacao ~ '^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$' THEN
    -- Extrair latitude e longitude do campo localizacao (formato "lat,lng")
    coords := string_to_array(NEW.localizacao, ',');
    lat := coords[1]::numeric;
    lng := coords[2]::numeric;
    NEW.location_geog := ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar location_geog automaticamente
-- Suprimir NOTICE ao dropar trigger inexistente
SET client_min_messages TO WARNING;
DROP TRIGGER IF EXISTS trg_update_location_geog ON tb_lote_residuo;
SET client_min_messages TO NOTICE;
CREATE TRIGGER trg_update_location_geog
  BEFORE INSERT OR UPDATE ON tb_lote_residuo
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_location_geog();
