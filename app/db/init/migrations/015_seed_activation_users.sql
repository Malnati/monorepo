-- app/db/init/migrations/015_seed_activation_users.sql

-- Seeds de teste para demonstrar diferentes estados de ativação
-- Hash de token de exemplo usando sha256: 'test-token-123' -> hash conhecido

-- Usuário pendente de ativação (token válido por 24h a partir de agora)
INSERT INTO tb_user (email, google_id, status_ativacao, token_ativacao, token_expires_at, created_at, updated_at)
VALUES (
    'pendente@test.com',
    NULL,
    'pendente',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', -- hash exemplo
    CURRENT_TIMESTAMP + INTERVAL '24 hours',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Usuário com token expirado
INSERT INTO tb_user (email, google_id, status_ativacao, token_ativacao, token_expires_at, created_at, updated_at)
VALUES (
    'expirado@test.com',
    NULL,
    'expirado',
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP - INTERVAL '25 hours',
    CURRENT_TIMESTAMP - INTERVAL '25 hours'
);

-- Usuário já ativado
INSERT INTO tb_user (email, google_id, status_ativacao, token_ativacao, token_expires_at, data_ativacao, email_validado_em, created_at, updated_at)
VALUES (
    'ativado@test.com',
    NULL,
    'ativado',
    NULL,
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    CURRENT_TIMESTAMP - INTERVAL '2 days'
);

-- Registrar auditoria para os usuários de teste
INSERT INTO tb_user_activation_audit (user_id, acao, ip_address, user_agent, sucesso, mensagem)
SELECT id, 'registro', '127.0.0.1', 'Test Seed Script', true, 'Usuário de teste criado via seed'
FROM tb_user WHERE email IN ('pendente@test.com', 'expirado@test.com', 'ativado@test.com');

-- Registrar ativação bem-sucedida para usuário ativado
INSERT INTO tb_user_activation_audit (user_id, acao, ip_address, user_agent, sucesso, mensagem, created_at)
SELECT id, 'ativacao', '127.0.0.1', 'Mozilla/5.0 Test Browser', true, 'Ativação bem-sucedida via link de e-mail', CURRENT_TIMESTAMP - INTERVAL '2 days'
FROM tb_user WHERE email = 'ativado@test.com';

-- Registrar expiração para usuário expirado
INSERT INTO tb_user_activation_audit (user_id, acao, ip_address, user_agent, sucesso, mensagem, created_at)
SELECT id, 'expiracao', NULL, NULL, false, 'Token expirado após 24 horas sem ativação', CURRENT_TIMESTAMP - INTERVAL '1 hour'
FROM tb_user WHERE email = 'expirado@test.com';
