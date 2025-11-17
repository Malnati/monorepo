-- app/db/init/migrations/007_location_layers.sql
-- Adicionar camadas de localização (real, bairro, cidade) para tb_lote_residuo

-- Adicionar campos para nomes das localidades
ALTER TABLE tb_lote_residuo
  ADD COLUMN IF NOT EXISTS city_name VARCHAR(120),
  ADD COLUMN IF NOT EXISTS neighborhood_name VARCHAR(120);

-- Adicionar campos geoespaciais para localização da cidade e bairro
ALTER TABLE tb_lote_residuo
  ADD COLUMN IF NOT EXISTS city_location_geog GEOGRAPHY(POINT, 4326),
  ADD COLUMN IF NOT EXISTS neighborhood_location_geog GEOGRAPHY(POINT, 4326);

-- Adicionar campos auxiliares para armazenar coordenadas em formato texto (fallback quando PostGIS indisponível)
ALTER TABLE tb_lote_residuo
  ADD COLUMN IF NOT EXISTS city_location_raw VARCHAR(255),
  ADD COLUMN IF NOT EXISTS neighborhood_location_raw VARCHAR(255);

-- Criar índices espaciais GIST para performance em queries de proximidade
CREATE INDEX IF NOT EXISTS idx_tb_lote_residuo_city_location_geog 
ON tb_lote_residuo USING GIST (city_location_geog)
WHERE city_location_geog IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tb_lote_residuo_neighborhood_location_geog 
ON tb_lote_residuo USING GIST (neighborhood_location_geog)
WHERE neighborhood_location_geog IS NOT NULL;

-- Atualizar função fn_update_location_geog para processar todas as camadas de localização
CREATE OR REPLACE FUNCTION fn_update_location_geog()
RETURNS TRIGGER AS $$
DECLARE
  coords text[];
  lat numeric;
  lng numeric;
  city_coords text[];
  city_lat numeric;
  city_lng numeric;
  neighborhood_coords text[];
  neighborhood_lat numeric;
  neighborhood_lng numeric;
BEGIN
  -- Processar localização real (existente)
  IF NEW.formatted_address IS NOT NULL AND 
     NEW.location_geog IS NULL AND
     NEW.localizacao IS NOT NULL AND 
     NEW.localizacao ~ '^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$' THEN
    coords := string_to_array(NEW.localizacao, ',');
    lat := coords[1]::numeric;
    lng := coords[2]::numeric;
    NEW.location_geog := ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography;
  END IF;

  -- Processar localização da cidade
  IF NEW.city_location_raw IS NOT NULL AND 
     NEW.city_location_geog IS NULL AND
     NEW.city_location_raw ~ '^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$' THEN
    city_coords := string_to_array(NEW.city_location_raw, ',');
    city_lat := city_coords[1]::numeric;
    city_lng := city_coords[2]::numeric;
    NEW.city_location_geog := ST_SetSRID(ST_MakePoint(city_lng, city_lat), 4326)::geography;
  END IF;

  -- Processar localização do bairro
  IF NEW.neighborhood_location_raw IS NOT NULL AND 
     NEW.neighborhood_location_geog IS NULL AND
     NEW.neighborhood_location_raw ~ '^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$' THEN
    neighborhood_coords := string_to_array(NEW.neighborhood_location_raw, ',');
    neighborhood_lat := neighborhood_coords[1]::numeric;
    neighborhood_lng := neighborhood_coords[2]::numeric;
    NEW.neighborhood_location_geog := ST_SetSRID(ST_MakePoint(neighborhood_lng, neighborhood_lat), 4326)::geography;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar trigger para aplicar a função atualizada
DROP TRIGGER IF EXISTS trg_update_location_geog ON tb_lote_residuo;
CREATE TRIGGER trg_update_location_geog
  BEFORE INSERT OR UPDATE ON tb_lote_residuo
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_location_geog();
