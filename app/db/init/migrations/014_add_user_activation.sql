-- app/db/init/migrations/014_add_user_activation.sql

-- Adicionar campos de ativação à tabela tb_user
ALTER TABLE tb_user
ADD COLUMN status_ativacao VARCHAR(20) DEFAULT 'pendente' CHECK (status_ativacao IN ('pendente', 'ativado', 'expirado')),
ADD COLUMN token_ativacao VARCHAR(255),
ADD COLUMN token_expires_at TIMESTAMP,
ADD COLUMN data_ativacao TIMESTAMP,
ADD COLUMN email_validado_em TIMESTAMP;

-- Criar índices para performance
CREATE INDEX idx_user_status_ativacao ON tb_user(status_ativacao);
CREATE INDEX idx_user_token_ativacao ON tb_user(token_ativacao) WHERE token_ativacao IS NOT NULL;
CREATE INDEX idx_user_token_expires_at ON tb_user(token_expires_at) WHERE token_expires_at IS NOT NULL;

-- Criar tabela de auditoria de ativações
CREATE TABLE tb_user_activation_audit (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES tb_user(id) ON DELETE CASCADE,
    acao VARCHAR(50) NOT NULL CHECK (acao IN ('registro', 'reenvio', 'ativacao', 'expiracao')),
    ip_address VARCHAR(45),
    user_agent TEXT,
    sucesso BOOLEAN DEFAULT true,
    mensagem TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_audit_acao_valid CHECK (acao IN ('registro', 'reenvio', 'ativacao', 'expiracao'))
);

-- Índices para auditoria
CREATE INDEX idx_audit_user_id ON tb_user_activation_audit(user_id);
CREATE INDEX idx_audit_acao ON tb_user_activation_audit(acao);
CREATE INDEX idx_audit_created_at ON tb_user_activation_audit(created_at);

-- Atualizar usuários existentes para status 'ativado'
UPDATE tb_user SET status_ativacao = 'ativado', data_ativacao = created_at, email_validado_em = created_at WHERE status_ativacao = 'pendente';
