-- app/db/init/migrations/016_enhance_user_activation_comments.sql

-- Comentários para tabela tb_user_activation_logs
COMMENT ON TABLE tb_user_activation_logs IS 'Auditoria completa de eventos de ativação de usuários incluindo validações por IA';
COMMENT ON COLUMN tb_user_activation_logs.id IS 'Identificador único do log';
COMMENT ON COLUMN tb_user_activation_logs.user_id IS 'Referência ao usuário';
COMMENT ON COLUMN tb_user_activation_logs.status IS 'Status do evento de ativação';
COMMENT ON COLUMN tb_user_activation_logs.reason IS 'Motivo ou descrição do evento';
COMMENT ON COLUMN tb_user_activation_logs.metadata IS 'Dados adicionais em formato JSON (resposta IA, dados de validação, etc)';
COMMENT ON COLUMN tb_user_activation_logs.ip_address IS 'Endereço IP de origem da requisição';
COMMENT ON COLUMN tb_user_activation_logs.user_agent IS 'User agent do navegador/cliente';
COMMENT ON COLUMN tb_user_activation_logs.created_at IS 'Timestamp de criação do registro';

-- Comentários para tabela tb_publication_reviews
COMMENT ON TABLE tb_publication_reviews IS 'Registro de moderação de publicações realizada por agentes de IA';
COMMENT ON COLUMN tb_publication_reviews.id IS 'Identificador único da revisão';
COMMENT ON COLUMN tb_publication_reviews.publication_type IS 'Tipo de publicação (lote_residuo, credito_carbono, etc)';
COMMENT ON COLUMN tb_publication_reviews.publication_id IS 'ID da publicação no sistema de origem';
COMMENT ON COLUMN tb_publication_reviews.user_id IS 'Referência ao usuário autor da publicação';
COMMENT ON COLUMN tb_publication_reviews.status IS 'Resultado da análise: approved, needs_revision, blocked';
COMMENT ON COLUMN tb_publication_reviews.reason IS 'Justificativa da decisão';
COMMENT ON COLUMN tb_publication_reviews.issues IS 'Lista de problemas identificados em formato JSON';
COMMENT ON COLUMN tb_publication_reviews.suggestions IS 'Sugestões de correção em formato JSON';
COMMENT ON COLUMN tb_publication_reviews.ai_model IS 'Modelo de IA utilizado para análise';
COMMENT ON COLUMN tb_publication_reviews.ai_response IS 'Resposta completa da IA em formato JSON';
COMMENT ON COLUMN tb_publication_reviews.reviewed_at IS 'Timestamp da revisão';
COMMENT ON COLUMN tb_publication_reviews.reviewed_by IS 'Identificador do agente revisor';

-- Comentários para view vw_users_pending_activation
COMMENT ON VIEW vw_users_pending_activation IS 'View otimizada para consultar usuários elegíveis para ativação automática (sem vínculo com fornecedor ou comprador)';
