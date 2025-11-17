-- app/db/init/migrations/012_add_email_to_participants_comments.sql

-- Comentários para o campo email em tb_fornecedor
COMMENT ON COLUMN tb_fornecedor.email IS 
'Endereço de e-mail do fornecedor para notificações transacionais e comunicação. Validado por regex para formato padrão RFC 5322. Utilizado pela integração Gmail (REQ-GMAIL-002) para envio automático de comprovantes de transação. Índice idx_fornecedor_email criado para otimização de consultas.';

-- Comentários para o campo email em tb_comprador
COMMENT ON COLUMN tb_comprador.email IS 
'Endereço de e-mail do comprador para notificações transacionais e comunicação. Validado por regex para formato padrão RFC 5322. Utilizado pela integração Gmail (REQ-GMAIL-002) para envio automático de comprovantes de transação. Índice idx_comprador_email criado para otimização de consultas.';
