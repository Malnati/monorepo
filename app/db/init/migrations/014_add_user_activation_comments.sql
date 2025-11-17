-- app/db/init/migrations/014_add_user_activation_comments.sql

-- Comentários para campos de ativação em tb_user
COMMENT ON COLUMN tb_user.status_ativacao IS 'Status da ativação do usuário: pendente (aguardando ativação por e-mail), ativado (conta ativa), expirado (token expirou)';
COMMENT ON COLUMN tb_user.token_ativacao IS 'Token único (hash) para ativação da conta via e-mail. Valor NULL após ativação ou expiração.';
COMMENT ON COLUMN tb_user.token_expires_at IS 'Data/hora de expiração do token de ativação (24h após geração). NULL se já ativado ou sem token pendente.';
COMMENT ON COLUMN tb_user.data_ativacao IS 'Data/hora em que a conta foi ativada via link de e-mail. NULL se ainda pendente.';
COMMENT ON COLUMN tb_user.email_validado_em IS 'Data/hora da validação do e-mail (mesmo que data_ativacao). Usado para conformidade LGPD.';

-- Comentários para tb_user_activation_audit
COMMENT ON TABLE tb_user_activation_audit IS 'Tabela de auditoria para rastrear todas as ações relacionadas ao fluxo de ativação de usuários, incluindo registros, reenvios, ativações e expirações. Essencial para conformidade LGPD e investigação de abusos.';
COMMENT ON COLUMN tb_user_activation_audit.user_id IS 'ID do usuário relacionado à ação auditada';
COMMENT ON COLUMN tb_user_activation_audit.acao IS 'Tipo de ação: registro (criação inicial), reenvio (novo e-mail solicitado), ativacao (link clicado com sucesso), expiracao (token expirou)';
COMMENT ON COLUMN tb_user_activation_audit.ip_address IS 'Endereço IP da requisição (formato IPv4 ou IPv6). Usado para detectar tentativas de abuso e para relatórios de segurança.';
COMMENT ON COLUMN tb_user_activation_audit.user_agent IS 'User-Agent HTTP do navegador/cliente. Auxilia na identificação de padrões de uso e potenciais bots.';
COMMENT ON COLUMN tb_user_activation_audit.sucesso IS 'Indica se a ação foi bem-sucedida (true) ou falhou (false). Usado para métricas de conversão.';
COMMENT ON COLUMN tb_user_activation_audit.mensagem IS 'Mensagem descritiva adicional sobre a ação ou erro ocorrido. Auxilia em debugging e suporte.';
COMMENT ON COLUMN tb_user_activation_audit.created_at IS 'Timestamp da ação auditada (UTC). Preserva ordem cronológica para análise.';
