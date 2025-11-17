-- app/db/init/migrations/026_add_approximate_location.sql
-- Adicionar campos de localização aproximada para privacidade
-- Script idempotente: funciona com tb_lote_residuo ou tb_offer

DO $$
DECLARE
    table_name_var TEXT;
BEGIN
    -- Verificar qual tabela existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tb_offer') THEN
        table_name_var := 'tb_offer';
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tb_lote_residuo') THEN
        table_name_var := 'tb_lote_residuo';
    ELSE
        RETURN; -- Nenhuma tabela existe, sair
    END IF;

    -- Adicionar colunas para localização aproximada (deslocada ~15km da real)
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS approx_location_geog geography(Point, 4326)', table_name_var);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS approx_location_raw VARCHAR(255)', table_name_var);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS approx_formatted_address VARCHAR(255)', table_name_var);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS approx_geocoding_accuracy VARCHAR(20)', table_name_var);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS approx_place_id VARCHAR(64)', table_name_var);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS approx_city_name VARCHAR(120)', table_name_var);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS approx_city_location_raw VARCHAR(255)', table_name_var);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS approx_city_location_geog geography(Point, 4326)', table_name_var);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS approx_neighborhood_name VARCHAR(120)', table_name_var);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS approx_neighborhood_location_raw VARCHAR(255)', table_name_var);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS approx_neighborhood_location_geog geography(Point, 4326)', table_name_var);

    -- Criar índices espaciais para consultas de localização aproximada
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_lote_approx_location_geog ON %I USING GIST(approx_location_geog)', table_name_var);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_lote_approx_city_location_geog ON %I USING GIST(approx_city_location_geog)', table_name_var);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_lote_approx_neighborhood_location_geog ON %I USING GIST(approx_neighborhood_location_geog)', table_name_var);
END $$;
