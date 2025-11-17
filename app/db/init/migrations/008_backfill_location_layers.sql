-- app/db/init/migrations/008_backfill_location_layers.sql
-- Backfill das camadas de localização para lotes existentes sem neighborhood/city
-- Utiliza coordenadas aproximadas baseadas na localização real de cada lote

-- Atualizar lotes sem neighborhood_name com dados aproximados
-- Todos os lotes estão em Brasília, extraímos o bairro do formatted_address quando disponível

UPDATE tb_lote_residuo
SET 
  city_name = 'Brasília',
  city_location_raw = '-15.7942,-47.8822',
  city_location_geog = ST_SetSRID(ST_MakePoint(-47.8822, -15.7942), 4326)::geography
WHERE city_name IS NULL;

-- Atualizar neighborhoods baseados nos endereços formatados existentes
-- Extraindo bairros de formatted_address e estimando centroides próximos à localização real

-- Lote 6: Eletrônicos (Shopping Popular da Ceilândia, Ceilândia)
UPDATE tb_lote_residuo
SET 
  neighborhood_name = 'Ceilândia Sul',
  neighborhood_location_raw = '-15.8200,-48.1100',
  neighborhood_location_geog = ST_SetSRID(ST_MakePoint(-48.1100, -15.8200), 4326)::geography
WHERE nome LIKE 'Eletrônicos - Lote%' AND formatted_address LIKE '%Ceilândia%'
  AND neighborhood_name IS NULL;

-- Lote 7: Eletrônicos - Celulares (Samambaia)
UPDATE tb_lote_residuo
SET 
  neighborhood_name = 'Samambaia Sul',
  neighborhood_location_raw = '-15.8800,-48.0900',
  neighborhood_location_geog = ST_SetSRID(ST_MakePoint(-48.0900, -15.8800), 4326)::geography
WHERE nome LIKE '%Celulares%' AND formatted_address LIKE '%Samambaia%'
  AND neighborhood_name IS NULL;

-- Lote 8: Entulho (Sobradinho)
UPDATE tb_lote_residuo
SET 
  neighborhood_name = 'Sobradinho I',
  neighborhood_location_raw = '-15.6500,-47.7900',
  neighborhood_location_geog = ST_SetSRID(ST_MakePoint(-47.7900, -15.6500), 4326)::geography
WHERE nome LIKE 'Entulho%' AND formatted_address LIKE '%Sobradinho%'
  AND neighborhood_name IS NULL;

-- Lote 9: Madeira de Construção (Planaltina)
UPDATE tb_lote_residuo
SET 
  neighborhood_name = 'Planaltina Centro',
  neighborhood_location_raw = '-15.6200,-47.6500',
  neighborhood_location_geog = ST_SetSRID(ST_MakePoint(-47.6500, -15.6200), 4326)::geography
WHERE nome LIKE 'Madeira de Construção%' AND formatted_address LIKE '%Planaltina%'
  AND neighborhood_name IS NULL;

-- Lote 10: Papel e Papelão (Plano Piloto - Asa Sul)
UPDATE tb_lote_residuo
SET 
  neighborhood_name = 'Asa Sul',
  neighborhood_location_raw = '-15.8200,-47.9000',
  neighborhood_location_geog = ST_SetSRID(ST_MakePoint(-47.9000, -15.8200), 4326)::geography
WHERE nome LIKE 'Papel e Papelão%' AND formatted_address LIKE '%Asa Sul%'
  AND neighborhood_name IS NULL;

-- Demais lotes: usar centroide de Brasília como fallback para bairro quando não especificado
-- Isso garante que todos os lotes tenham ao menos uma camada de bairro definida
UPDATE tb_lote_residuo
SET 
  neighborhood_name = COALESCE(
    CASE 
      WHEN formatted_address LIKE '%Taguatinga%' THEN 'Taguatinga Centro'
      WHEN formatted_address LIKE '%Guará%' THEN 'Guará I'
      WHEN formatted_address LIKE '%Ceilândia%' THEN 'Ceilândia Centro'
      WHEN formatted_address LIKE '%Samambaia%' THEN 'Samambaia Sul'
      WHEN formatted_address LIKE '%Planaltina%' THEN 'Planaltina Centro'
      WHEN formatted_address LIKE '%Sobradinho%' THEN 'Sobradinho I'
      WHEN formatted_address LIKE '%Asa Norte%' THEN 'Asa Norte'
      WHEN formatted_address LIKE '%Asa Sul%' THEN 'Asa Sul'
      WHEN formatted_address LIKE '%Esplanada%' THEN 'Esplanada dos Ministérios'
      ELSE 'Plano Piloto'
    END
  ),
  neighborhood_location_raw = COALESCE(
    neighborhood_location_raw,
    CASE 
      WHEN formatted_address LIKE '%Taguatinga%' THEN '-15.8350,-48.0580'
      WHEN formatted_address LIKE '%Guará%' THEN '-15.8300,-47.9700'
      WHEN formatted_address LIKE '%Ceilândia%' THEN '-15.8180,-48.1100'
      WHEN formatted_address LIKE '%Samambaia%' THEN '-15.8800,-48.0900'
      WHEN formatted_address LIKE '%Planaltina%' THEN '-15.6200,-47.6500'
      WHEN formatted_address LIKE '%Sobradinho%' THEN '-15.6500,-47.7900'
      WHEN formatted_address LIKE '%Asa Norte%' THEN '-15.7850,-47.8850'
      WHEN formatted_address LIKE '%Asa Sul%' THEN '-15.8200,-47.9000'
      WHEN formatted_address LIKE '%Esplanada%' THEN '-15.7980,-47.8750'
      ELSE localizacao
    END
  ),
  neighborhood_location_geog = COALESCE(
    neighborhood_location_geog,
    CASE 
      WHEN formatted_address LIKE '%Taguatinga%' THEN ST_SetSRID(ST_MakePoint(-48.0580, -15.8350), 4326)::geography
      WHEN formatted_address LIKE '%Guará%' THEN ST_SetSRID(ST_MakePoint(-47.9700, -15.8300), 4326)::geography
      WHEN formatted_address LIKE '%Ceilândia%' THEN ST_SetSRID(ST_MakePoint(-48.1100, -15.8180), 4326)::geography
      WHEN formatted_address LIKE '%Samambaia%' THEN ST_SetSRID(ST_MakePoint(-48.0900, -15.8800), 4326)::geography
      WHEN formatted_address LIKE '%Planaltina%' THEN ST_SetSRID(ST_MakePoint(-47.6500, -15.6200), 4326)::geography
      WHEN formatted_address LIKE '%Sobradinho%' THEN ST_SetSRID(ST_MakePoint(-47.7900, -15.6500), 4326)::geography
      WHEN formatted_address LIKE '%Asa Norte%' THEN ST_SetSRID(ST_MakePoint(-47.8850, -15.7850), 4326)::geography
      WHEN formatted_address LIKE '%Asa Sul%' THEN ST_SetSRID(ST_MakePoint(-47.9000, -15.8200), 4326)::geography
      WHEN formatted_address LIKE '%Esplanada%' THEN ST_SetSRID(ST_MakePoint(-47.8750, -15.7980), 4326)::geography
      ELSE location_geog
    END
  )
WHERE neighborhood_name IS NULL;

-- Verificar resultado do backfill
DO $$
DECLARE
  total_lotes INTEGER;
  lotes_com_city INTEGER;
  lotes_com_neighborhood INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_lotes FROM tb_lote_residuo;
  SELECT COUNT(*) INTO lotes_com_city FROM tb_lote_residuo WHERE city_name IS NOT NULL;
  SELECT COUNT(*) INTO lotes_com_neighborhood FROM tb_lote_residuo WHERE neighborhood_name IS NOT NULL;
  
  RAISE NOTICE 'Backfill de localização concluído:';
  RAISE NOTICE '  Total de lotes: %', total_lotes;
  RAISE NOTICE '  Lotes com city_name: % (%.0f%%)', lotes_com_city, (lotes_com_city::float / total_lotes * 100);
  RAISE NOTICE '  Lotes com neighborhood_name: % (%.0f%%)', lotes_com_neighborhood, (lotes_com_neighborhood::float / total_lotes * 100);
  
  IF lotes_com_city < total_lotes OR lotes_com_neighborhood < total_lotes THEN
    RAISE WARNING 'Alguns lotes ainda não possuem todas as camadas de localização preenchidas';
  END IF;
END $$;
