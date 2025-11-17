-- app/db/init/migrations/005_create_tb_user_comments.sql

-- Comentários para tabela tb_user
COMMENT ON TABLE tb_user IS 'Tabela de usuários autenticados via Google SSO. Armazena apenas email e google_id para autenticação.';
COMMENT ON COLUMN tb_user.id IS 'Identificador único sequencial do usuário';
COMMENT ON COLUMN tb_user.email IS 'Email do usuário obtido via Google SSO. Usado como identificador de login único.';
COMMENT ON COLUMN tb_user.google_id IS 'ID único do Google (claim sub do token JWT). Preenchido no primeiro login.';
COMMENT ON COLUMN tb_user.created_at IS 'Data e hora de criação do registro';
COMMENT ON COLUMN tb_user.updated_at IS 'Data e hora da última atualização do registro';

-- Comentários para tabela tb_user_fornecedor
COMMENT ON TABLE tb_user_fornecedor IS 'Tabela de relacionamento N:M entre usuários e fornecedores. Um usuário pode gerenciar múltiplos fornecedores.';
COMMENT ON COLUMN tb_user_fornecedor.id IS 'Identificador único do relacionamento';
COMMENT ON COLUMN tb_user_fornecedor.user_id IS 'Referência ao usuário (tb_user)';
COMMENT ON COLUMN tb_user_fornecedor.fornecedor_id IS 'Referência ao fornecedor (tb_fornecedor)';
COMMENT ON COLUMN tb_user_fornecedor.created_at IS 'Data e hora de criação do relacionamento';

-- Comentários para tabela tb_user_comprador
COMMENT ON TABLE tb_user_comprador IS 'Tabela de relacionamento N:M entre usuários e compradores. Um usuário pode gerenciar múltiplos compradores.';
COMMENT ON COLUMN tb_user_comprador.id IS 'Identificador único do relacionamento';
COMMENT ON COLUMN tb_user_comprador.user_id IS 'Referência ao usuário (tb_user)';
COMMENT ON COLUMN tb_user_comprador.comprador_id IS 'Referência ao comprador (tb_comprador)';
COMMENT ON COLUMN tb_user_comprador.created_at IS 'Data e hora de criação do relacionamento';
