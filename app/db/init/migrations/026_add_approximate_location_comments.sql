-- app/db/init/migrations/026_add_approximate_location_comments.sql
-- Comentários idempotentes: funciona com tb_lote_residuo ou tb_offer

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

    -- Adicionar comentários apenas se as colunas existirem
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = table_name_var AND column_name = 'approx_location_geog') THEN
        EXECUTE format('COMMENT ON COLUMN %I.approx_location_geog IS %L', table_name_var, 'Localização geográfica aproximada (deslocada ~15km da real) para preservar privacidade do fornecedor');
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = table_name_var AND column_name = 'approx_location_raw') THEN
        EXECUTE format('COMMENT ON COLUMN %I.approx_location_raw IS %L', table_name_var, 'Coordenadas aproximadas em formato texto (lat,lng)');
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = table_name_var AND column_name = 'approx_formatted_address') THEN
        EXECUTE format('COMMENT ON COLUMN %I.approx_formatted_address IS %L', table_name_var, 'Endereço formatado da localização aproximada');
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = table_name_var AND column_name = 'approx_geocoding_accuracy') THEN
        EXECUTE format('COMMENT ON COLUMN %I.approx_geocoding_accuracy IS %L', table_name_var, 'Precisão da geocodificação da localização aproximada');
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = table_name_var AND column_name = 'approx_place_id') THEN
        EXECUTE format('COMMENT ON COLUMN %I.approx_place_id IS %L', table_name_var, 'Place ID do Google Maps da localização aproximada');
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = table_name_var AND column_name = 'approx_city_name') THEN
        EXECUTE format('COMMENT ON COLUMN %I.approx_city_name IS %L', table_name_var, 'Nome da cidade da localização aproximada');
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = table_name_var AND column_name = 'approx_city_location_raw') THEN
        EXECUTE format('COMMENT ON COLUMN %I.approx_city_location_raw IS %L', table_name_var, 'Coordenadas da cidade aproximada em formato texto');
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = table_name_var AND column_name = 'approx_city_location_geog') THEN
        EXECUTE format('COMMENT ON COLUMN %I.approx_city_location_geog IS %L', table_name_var, 'Localização geográfica da cidade aproximada');
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = table_name_var AND column_name = 'approx_neighborhood_name') THEN
        EXECUTE format('COMMENT ON COLUMN %I.approx_neighborhood_name IS %L', table_name_var, 'Nome do bairro da localização aproximada');
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = table_name_var AND column_name = 'approx_neighborhood_location_raw') THEN
        EXECUTE format('COMMENT ON COLUMN %I.approx_neighborhood_location_raw IS %L', table_name_var, 'Coordenadas do bairro aproximado em formato texto');
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = table_name_var AND column_name = 'approx_neighborhood_location_geog') THEN
        EXECUTE format('COMMENT ON COLUMN %I.approx_neighborhood_location_geog IS %L', table_name_var, 'Localização geográfica do bairro aproximado');
    END IF;
END $$;
