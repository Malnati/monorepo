-- app/db/init/migrations/022_add_approximate_location_comments.sql

COMMENT ON COLUMN tb_lote_residuo.approx_location_geog IS 'Localização geográfica aproximada (deslocada ~15km da real) para preservar privacidade do fornecedor';
COMMENT ON COLUMN tb_lote_residuo.approx_location_raw IS 'Coordenadas aproximadas em formato texto (lat,lng)';
COMMENT ON COLUMN tb_lote_residuo.approx_formatted_address IS 'Endereço formatado da localização aproximada';
COMMENT ON COLUMN tb_lote_residuo.approx_geocoding_accuracy IS 'Precisão da geocodificação da localização aproximada';
COMMENT ON COLUMN tb_lote_residuo.approx_place_id IS 'Place ID do Google Maps da localização aproximada';
COMMENT ON COLUMN tb_lote_residuo.approx_city_name IS 'Nome da cidade da localização aproximada';
COMMENT ON COLUMN tb_lote_residuo.approx_city_location_raw IS 'Coordenadas da cidade aproximada em formato texto';
COMMENT ON COLUMN tb_lote_residuo.approx_city_location_geog IS 'Localização geográfica da cidade aproximada';
COMMENT ON COLUMN tb_lote_residuo.approx_neighborhood_name IS 'Nome do bairro da localização aproximada';
COMMENT ON COLUMN tb_lote_residuo.approx_neighborhood_location_raw IS 'Coordenadas do bairro aproximado em formato texto';
COMMENT ON COLUMN tb_lote_residuo.approx_neighborhood_location_geog IS 'Localização geográfica do bairro aproximado';
