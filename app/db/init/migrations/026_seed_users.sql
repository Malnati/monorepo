-- app/db/init/migrations/006_seed_users.sql

-- Inserir usuários autorizados na carga inicial
INSERT INTO tb_user (email, created_at, updated_at) VALUES
('jbbalbino@gmail.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ricardomalnati@gmail.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Nota: google_id será preenchido automaticamente no primeiro login
-- quando o token do Google for validado
