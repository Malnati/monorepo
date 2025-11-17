-- app/db/init/migrations/002_add_geospatial_fields_comments.sql

-- Comentários obrigatórios para campos geoespaciais adicionados à tb_lote_residuo

COMMENT ON COLUMN tb_lote_residuo.location_geog IS 
'Coordenadas geográficas do lote usando tipo GEOGRAPHY(POINT, 4326) para cálculos de distância precisos considerando curvatura terrestre. Sistema de referência WGS84 (padrão Google Maps).';

COMMENT ON COLUMN tb_lote_residuo.formatted_address IS 
'Endereço formatado retornado pelo Google Geocoding API. Exemplo: "Rua das Flores, 123 - Curitiba/PR, Brasil". Usado como representação legível da localização.';

COMMENT ON COLUMN tb_lote_residuo.place_id IS 
'Identificador único do Google Places para a localização. Usado para referência futura e revalidação de coordenadas. Máximo 64 caracteres.';

COMMENT ON COLUMN tb_lote_residuo.geocoding_accuracy IS 
'Precisão do geocoding retornado pela API do Google. Valores possíveis: ROOFTOP (mais preciso), RANGE_INTERPOLATED, GEOMETRIC_CENTER, APPROXIMATE (menos preciso).';

COMMENT ON INDEX idx_tb_lote_residuo_location_geog IS 
'Índice espacial GIST para otimizar queries de proximidade (ST_DWithin) e bounding box (ST_MakeEnvelope). Essencial para performance em mapas interativos.';

COMMENT ON INDEX idx_tb_lote_residuo_place_id IS 
'Índice para busca rápida por place_id do Google Places. Usado para validação e cache de resultados do Geocoding API.';

COMMENT ON FUNCTION fn_update_location_geog() IS 
'Função trigger que popula automaticamente location_geog a partir do campo localizacao (formato "lat,lng") quando formatted_address é fornecido mas location_geog está vazio. Mantém compatibilidade retroativa com dados existentes.';

COMMENT ON TRIGGER trg_update_location_geog ON tb_lote_residuo IS 
'Trigger executado antes de INSERT ou UPDATE para garantir que location_geog seja populado automaticamente se os dados necessários estiverem disponíveis.';

COMMENT ON COLUMN tb_lote_residuo.city_name IS 
'Nome da cidade onde o lote está localizado. Usado para agregações e filtros por cidade. Máximo 120 caracteres.';

COMMENT ON COLUMN tb_lote_residuo.city_location_raw IS 
'Coordenadas brutas da cidade no formato "lat,lng". Usado como fallback quando city_location_geog não está disponível.';

COMMENT ON COLUMN tb_lote_residuo.city_location_geog IS 
'Coordenadas geográficas do centroide da cidade usando tipo GEOGRAPHY(POINT, 4326). Usado para cálculos de distância e agregações espaciais.';

COMMENT ON COLUMN tb_lote_residuo.neighborhood_name IS 
'Nome do bairro onde o lote está localizado. Usado para agregações e filtros por bairro. Máximo 120 caracteres.';

COMMENT ON COLUMN tb_lote_residuo.neighborhood_location_raw IS 
'Coordenadas brutas do bairro no formato "lat,lng". Usado como fallback quando neighborhood_location_geog não está disponível.';

COMMENT ON COLUMN tb_lote_residuo.neighborhood_location_geog IS 
'Coordenadas geográficas do centroide do bairro usando tipo GEOGRAPHY(POINT, 4326). Usado para cálculos de distância e agregações espaciais.';

COMMENT ON INDEX idx_tb_lote_residuo_city_location_geog IS 
'Índice espacial GIST para otimizar queries de proximidade e agregações por cidade. Essencial para performance em análises geográficas.';

COMMENT ON INDEX idx_tb_lote_residuo_neighborhood_location_geog IS 
'Índice espacial GIST para otimizar queries de proximidade e agregações por bairro. Essencial para performance em análises geográficas.';
