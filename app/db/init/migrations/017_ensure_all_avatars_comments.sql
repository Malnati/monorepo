-- app/db/init/migrations/017_ensure_all_avatars_comments.sql

COMMENT ON TABLE tb_fornecedor IS 'Tabela de fornecedores de resíduos. Todos os fornecedores devem possuir avatar após a execução da migração 017_ensure_all_avatars.sql';
COMMENT ON COLUMN tb_fornecedor.avatar IS 'Avatar do fornecedor em formato BYTEA (JPEG). Todos os fornecedores devem possuir avatar após a carga inicial.';

COMMENT ON TABLE tb_comprador IS 'Tabela de compradores de resíduos. Todos os compradores devem possuir avatar após a execução da migração 017_ensure_all_avatars.sql';
COMMENT ON COLUMN tb_comprador.avatar IS 'Avatar do comprador em formato BYTEA (JPEG). Todos os compradores devem possuir avatar após a carga inicial.';

