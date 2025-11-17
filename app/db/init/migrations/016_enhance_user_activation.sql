-- app/db/init/migrations/016_enhance_user_activation.sql

-- Adicionar novo status 'bloqueado' ao enum de status_ativacao
ALTER TABLE tb_user DROP CONSTRAINT IF EXISTS tb_user_status_ativacao_check;
ALTER TABLE tb_user 
ADD CONSTRAINT tb_user_status_ativacao_check 
CHECK (status_ativacao IN ('pendente', 'ativado', 'expirado', 'bloqueado'));

-- Criar tabela de logs de ativação de usuários (auditoria completa)
CREATE TABLE IF NOT EXISTS tb_user_activation_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES tb_user(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL CHECK (status IN (
        'pending_activation',
        'activation_confirmed',
        'activation_denied',
        'token_sent',
        'token_expired',
        'domain_rejected',
        'eligibility_rejected',
        'eligibility_approved'
    )),
    reason TEXT,
    metadata JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_activation_logs_user_id ON tb_user_activation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activation_logs_status ON tb_user_activation_logs(status);
CREATE INDEX IF NOT EXISTS idx_activation_logs_created_at ON tb_user_activation_logs(created_at);

-- Criar tabela de revisão de publicações (moderação IA)
CREATE TABLE IF NOT EXISTS tb_publication_reviews (
    id SERIAL PRIMARY KEY,
    publication_type VARCHAR(50) NOT NULL, -- 'lote_residuo', 'credito_carbono', etc
    publication_id INT,
    user_id INT REFERENCES tb_user(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('approved', 'needs_revision', 'blocked')),
    reason TEXT,
    issues JSONB,
    suggestions JSONB,
    ai_model VARCHAR(100),
    ai_response JSONB,
    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by VARCHAR(50) DEFAULT 'ai_agent'
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_publication_reviews_user_id ON tb_publication_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_publication_reviews_status ON tb_publication_reviews(status);
CREATE INDEX IF NOT EXISTS idx_publication_reviews_type_id ON tb_publication_reviews(publication_type, publication_id);
CREATE INDEX IF NOT EXISTS idx_publication_reviews_reviewed_at ON tb_publication_reviews(reviewed_at);

-- Criar view para usuários pendentes de ativação
CREATE OR REPLACE VIEW vw_users_pending_activation AS
SELECT 
    u.id,
    u.email,
    u.status_ativacao,
    u.token_ativacao,
    u.token_expires_at,
    u.created_at,
    COUNT(uf.fornecedor_id) as fornecedor_count,
    COUNT(uc.comprador_id) as comprador_count
FROM tb_user u
LEFT JOIN tb_user_fornecedor uf ON u.id = uf.user_id
LEFT JOIN tb_user_comprador uc ON u.id = uc.user_id
WHERE u.status_ativacao = 'pendente'
  AND u.token_ativacao IS NULL
GROUP BY u.id, u.email, u.status_ativacao, u.token_ativacao, u.token_expires_at, u.created_at
HAVING COUNT(uf.fornecedor_id) = 0 AND COUNT(uc.comprador_id) = 0;
