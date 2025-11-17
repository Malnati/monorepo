-- app/db/init/migrations/032_update_trigger_function_for_offer.sql

-- ====================================================================
-- MIGRATION: Atualizar função trigger para usar novos nomes de campos
-- Data: 2025-01-XX
-- Descrição: Atualiza fn_update_location_geog() para usar 'location' em vez de 'localizacao'
-- Referência: Schema de referência db-schema.sql
-- ====================================================================

-- Atualizar função trigger para usar novos nomes de campos (location em vez de localizacao)
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
     NEW.location IS NOT NULL AND 
     NEW.location ~ '^-?[0-9]+\.?[0-9]*,-?[0-9]+\.?[0-9]*$' THEN
    coords := string_to_array(NEW.location, ',');
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

-- Atualizar trigger para usar tb_offer
DROP TRIGGER IF EXISTS trg_update_location_geog ON tb_offer;
CREATE TRIGGER trg_update_location_geog
  BEFORE INSERT OR UPDATE ON tb_offer
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_location_geog();

COMMENT ON FUNCTION fn_update_location_geog() IS 'Função trigger que popula automaticamente location_geog a partir do campo location (formato "lat,lng") quando formatted_address é fornecido mas location_geog está vazio. Mantém compatibilidade retroativa com dados existentes. Processa também city_location_geog e neighborhood_location_geog.';

COMMENT ON TRIGGER trg_update_location_geog ON tb_offer IS 'Trigger executado antes de INSERT ou UPDATE para garantir que location_geog seja populado automaticamente se os dados necessários estiverem disponíveis.';
