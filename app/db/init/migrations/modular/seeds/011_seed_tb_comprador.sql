-- app/db/init/migrations/modular/seeds/011_seed_tb_comprador.sql

-- Seed: comprador padrão para transações de teste
INSERT INTO tb_comprador (id, nome, whatsapp, created_at, updated_at) 
VALUES (1, 'Comprador Padrão', '11988888888', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;
