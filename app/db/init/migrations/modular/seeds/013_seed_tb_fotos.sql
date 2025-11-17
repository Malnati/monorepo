-- app/db/init/migrations/modular/seeds/013_seed_tb_fotos.sql

-- Seed de fotos para os offers de teste
-- Referência: docs/rup/99-anexos/MVP/offer-image-mapping.md

-- Foto para Offer 1: Garrafas PET Incolor Premium
INSERT INTO tb_fotos (offer_id, imagem, created_at, updated_at)
SELECT 
    o.id,
    pg_read_binary_file('/opt/dominio/seeds/img/garrafas_pet.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM tb_offer o
WHERE o.title = 'Garrafas PET Incolor Premium'
  AND NOT EXISTS (
    SELECT 1 FROM tb_fotos WHERE offer_id = o.id
  );

-- Foto para Offer 2: Vidros Marrons de Cerveja
INSERT INTO tb_fotos (offer_id, imagem, created_at, updated_at)
SELECT 
    o.id,
    pg_read_binary_file('/opt/dominio/seeds/img/garrafas_cerveja_secas.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM tb_offer o
WHERE o.title = 'Vidros Marrons de Cerveja'
  AND NOT EXISTS (
    SELECT 1 FROM tb_fotos WHERE offer_id = o.id
  );

-- Foto para Offer 3: Plásticos Mistos de Embalagens
INSERT INTO tb_fotos (offer_id, imagem, created_at, updated_at)
SELECT 
    o.id,
    pg_read_binary_file('/opt/dominio/seeds/img/latas_refrigerante_copos_plastico.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM tb_offer o
WHERE o.title = 'Plásticos Mistos de Embalagens'
  AND NOT EXISTS (
    SELECT 1 FROM tb_fotos WHERE offer_id = o.id
  );

-- Foto para Offer 4: Papelão Ondulado Industrial
INSERT INTO tb_fotos (offer_id, imagem, created_at, updated_at)
SELECT 
    o.id,
    pg_read_binary_file('/opt/dominio/seeds/img/latas_refrigerante_copos_plastico.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM tb_offer o
WHERE o.title = 'Papelão Ondulado Industrial'
  AND NOT EXISTS (
    SELECT 1 FROM tb_fotos WHERE offer_id = o.id
  );

-- Foto para Offer 5: Latas de Alumínio
INSERT INTO tb_fotos (offer_id, imagem, created_at, updated_at)
SELECT 
    o.id,
    pg_read_binary_file('/opt/dominio/seeds/img/garrafas_agua_secas.jpg'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM tb_offer o
WHERE o.title = 'Latas de Alumínio'
  AND NOT EXISTS (
    SELECT 1 FROM tb_fotos WHERE offer_id = o.id
  );
