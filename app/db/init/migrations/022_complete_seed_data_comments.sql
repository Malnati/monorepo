-- app/db/init/migrations/018_complete_seed_data_comments.sql
-- Comentários sobre a migração 018_complete_seed_data.sql

COMMENT ON COLUMN tb_fornecedor.email IS 'E-mail para contato e notificações transacionais. Todos os fornecedores devem possuir e-mail preenchido nas cargas iniciais.';
COMMENT ON COLUMN tb_fornecedor.whatsapp IS 'Número do WhatsApp para contato direto. Todos os fornecedores devem possuir WhatsApp preenchido nas cargas iniciais.';
COMMENT ON COLUMN tb_comprador.email IS 'E-mail para contato e notificações transacionais. Todos os compradores devem possuir e-mail preenchido nas cargas iniciais.';
COMMENT ON COLUMN tb_comprador.whatsapp IS 'Número do WhatsApp para contato direto. Todos os compradores devem possuir WhatsApp preenchido nas cargas iniciais.';

