-- app/db/init/migrations/007_location_layers_comments.sql
-- Comentários para as novas colunas de camadas de localização

-- Nomes das localidades
COMMENT ON COLUMN tb_lote_residuo.city_name IS 
'Nome da cidade para exibição pública (ex: "Brasília"). Derivado de address_components do Google Maps (locality ou administrative_area_level_2).';

COMMENT ON COLUMN tb_lote_residuo.neighborhood_name IS 
'Nome do bairro para exibição pública (ex: "Asa Norte"). Derivado de address_components do Google Maps (sublocality ou neighborhood).';

-- Campos geoespaciais das localidades
COMMENT ON COLUMN tb_lote_residuo.city_location_geog IS 
'Coordenada geográfica do centroide da cidade. Usado para exibição em mapas quando a localização do bairro não está disponível. Formato: GEOGRAPHY(POINT, 4326).';

COMMENT ON COLUMN tb_lote_residuo.neighborhood_location_geog IS 
'Coordenada geográfica do centroide do bairro. Usado preferencialmente para marcadores em mapas públicos, preservando privacidade ao ocultar a localização exata. Formato: GEOGRAPHY(POINT, 4326).';

-- Campos auxiliares (fallback quando PostGIS indisponível)
COMMENT ON COLUMN tb_lote_residuo.city_location_raw IS 
'Coordenada da cidade em formato texto "latitude,longitude" (ex: "-15.7942,-47.8822"). Usado como fallback quando a extensão PostGIS não está disponível ou para facilitar debugging.';

COMMENT ON COLUMN tb_lote_residuo.neighborhood_location_raw IS 
'Coordenada do bairro em formato texto "latitude,longitude" (ex: "-15.7894,-47.8822"). Usado como fallback quando a extensão PostGIS não está disponível ou para facilitar debugging.';

-- Índices espaciais
COMMENT ON INDEX idx_tb_lote_residuo_city_location_geog IS 
'Índice espacial GIST para otimizar queries de proximidade baseadas na localização da cidade.';

COMMENT ON INDEX idx_tb_lote_residuo_neighborhood_location_geog IS 
'Índice espacial GIST para otimizar queries de proximidade baseadas na localização do bairro.';
