-- app/db/init/migrations/modular/seeds/010_seed_tb_fornecedor.sql

-- Seed: fornecedor padrão para criação de offers
INSERT INTO tb_fornecedor (id, nome, whatsapp, created_at, updated_at) 
VALUES (1, 'Fornecedor Padrão', '11999999999', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;
