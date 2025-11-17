-- app/db/init/ddl/005_ddl_tb_offer.sql

-- Tabela principal de offers de resíduo
CREATE TABLE IF NOT EXISTS tb_offer (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    preco NUMERIC(12,2),
    quantidade NUMERIC(12,2) NOT NULL,
    quantidade_vendida NUMERIC(12,2) DEFAULT 0 NOT NULL,
    location VARCHAR(255),
    tipo_id INT REFERENCES tb_tipo(id) ON DELETE SET NULL,
    unidade_id INT REFERENCES tb_unidade(id) ON DELETE SET NULL,
    fornecedor_id INT REFERENCES tb_fornecedor(id),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
    -- Campos geoespaciais
    location_geog GEOGRAPHY(POINT, 4326),
    formatted_address VARCHAR(255),
    place_id VARCHAR(64),
    geocoding_accuracy VARCHAR(20),
    -- Campos de localização da cidade
    city_name VARCHAR(120),
    city_location_raw VARCHAR(255),
    city_location_geog GEOGRAPHY(POINT, 4326),
    -- Campos de localização do bairro
    neighborhood_name VARCHAR(120),
    neighborhood_location_raw VARCHAR(255),
    neighborhood_location_geog GEOGRAPHY(POINT, 4326),
    -- Campos de localização aproximada (privacidade)
    approx_location_geog GEOGRAPHY(POINT, 4326),
    approx_location_raw VARCHAR(255),
    approx_formatted_address VARCHAR(255),
    approx_geocoding_accuracy VARCHAR(20),
    approx_place_id VARCHAR(64),
    approx_city_name VARCHAR(120),
    approx_city_location_raw VARCHAR(255),
    approx_city_location_geog GEOGRAPHY(POINT, 4326),
    approx_neighborhood_name VARCHAR(120),
    approx_neighborhood_location_raw VARCHAR(255),
    approx_neighborhood_location_geog GEOGRAPHY(POINT, 4326)
);

COMMENT ON TABLE tb_offer IS 'Tabela de offers de resíduos disponíveis para venda';
COMMENT ON COLUMN tb_offer.id IS 'Identificador único do offer';
COMMENT ON COLUMN tb_offer.title IS 'Título do offer';
COMMENT ON COLUMN tb_offer.description IS 'Descrição detalhada do offer';
COMMENT ON COLUMN tb_offer.preco IS 'Preço do offer em moeda local';
COMMENT ON COLUMN tb_offer.quantidade IS 'Quantidade total disponível';
COMMENT ON COLUMN tb_offer.quantidade_vendida IS 'Quantidade já vendida';
COMMENT ON COLUMN tb_offer.location IS 'Coordenadas do offer no formato lat,lng';
COMMENT ON COLUMN tb_offer.tipo_id IS 'FK para tb_tipo - tipo de resíduo';
COMMENT ON COLUMN tb_offer.unidade_id IS 'FK para tb_unidade - unidade de medida';
COMMENT ON COLUMN tb_offer.fornecedor_id IS 'FK para tb_fornecedor - fornecedor do offer';
COMMENT ON COLUMN tb_offer.created_at IS 'Data de criação do offer';
COMMENT ON COLUMN tb_offer.updated_at IS 'Data da última atualização';
COMMENT ON COLUMN tb_offer.location_geog IS 'Ponto geográfico PostGIS para consultas espaciais';
COMMENT ON COLUMN tb_offer.formatted_address IS 'Endereço formatado retornado pela API de geocoding';
COMMENT ON COLUMN tb_offer.place_id IS 'ID único do local no Google Maps';
COMMENT ON COLUMN tb_offer.geocoding_accuracy IS 'Nível de precisão do geocoding';
COMMENT ON COLUMN tb_offer.city_name IS 'Nome da cidade';
COMMENT ON COLUMN tb_offer.city_location_raw IS 'Coordenadas brutas da cidade';
COMMENT ON COLUMN tb_offer.city_location_geog IS 'Ponto geográfico da cidade';
COMMENT ON COLUMN tb_offer.neighborhood_name IS 'Nome do bairro (camada de localização)';
COMMENT ON COLUMN tb_offer.neighborhood_location_raw IS 'Coordenadas brutas do bairro';
COMMENT ON COLUMN tb_offer.neighborhood_location_geog IS 'Ponto geográfico do bairro';
COMMENT ON COLUMN tb_offer.approx_location_geog IS 'Localização aproximada (~15km) para privacidade';
COMMENT ON COLUMN tb_offer.approx_location_raw IS 'Coordenadas brutas da localização aproximada';
COMMENT ON COLUMN tb_offer.approx_formatted_address IS 'Endereço formatado da localização aproximada';
COMMENT ON COLUMN tb_offer.approx_geocoding_accuracy IS 'Precisão do geocoding aproximado';
COMMENT ON COLUMN tb_offer.approx_place_id IS 'Place ID da localização aproximada';
COMMENT ON COLUMN tb_offer.approx_city_name IS 'Nome da cidade (localização aproximada)';
COMMENT ON COLUMN tb_offer.approx_city_location_raw IS 'Coordenadas brutas da cidade (aprox)';
COMMENT ON COLUMN tb_offer.approx_city_location_geog IS 'Ponto geográfico da cidade (aprox)';
COMMENT ON COLUMN tb_offer.approx_neighborhood_name IS 'Nome do bairro (localização aproximada)';
COMMENT ON COLUMN tb_offer.approx_neighborhood_location_raw IS 'Coordenadas brutas do bairro (aprox)';
COMMENT ON COLUMN tb_offer.approx_neighborhood_location_geog IS 'Ponto geográfico do bairro (aprox)';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_tb_offer_location_geog 
ON tb_offer USING GIST (location_geog)
WHERE location_geog IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tb_offer_place_id 
ON tb_offer (place_id)
WHERE place_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tb_offer_city_location_geog 
ON tb_offer USING GIST (city_location_geog)
WHERE city_location_geog IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tb_offer_neighborhood_location_geog 
ON tb_offer USING GIST (neighborhood_location_geog)
WHERE neighborhood_location_geog IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tb_offer_approx_location_geog 
ON tb_offer USING GIST(approx_location_geog)
WHERE approx_location_geog IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tb_offer_approx_city_location_geog 
ON tb_offer USING GIST(approx_city_location_geog)
WHERE approx_city_location_geog IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tb_offer_approx_neighborhood_location_geog 
ON tb_offer USING GIST(approx_neighborhood_location_geog)
WHERE approx_neighborhood_location_geog IS NOT NULL;

-- Índices para chaves estrangeiras
CREATE INDEX IF NOT EXISTS idx_tb_offer_tipo_id ON tb_offer(tipo_id);
CREATE INDEX IF NOT EXISTS idx_tb_offer_unidade_id ON tb_offer(unidade_id);
CREATE INDEX IF NOT EXISTS idx_tb_offer_fornecedor_id ON tb_offer(fornecedor_id);

-- Função para popular location_geog a partir de latitude/longitude
-- Baseada na função fn_update_location_geog() do schema de referência
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

-- Trigger para atualizar location_geog automaticamente
DROP TRIGGER IF EXISTS trg_update_location_geog ON tb_offer;
CREATE TRIGGER trg_update_location_geog
  BEFORE INSERT OR UPDATE ON tb_offer
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_location_geog();
