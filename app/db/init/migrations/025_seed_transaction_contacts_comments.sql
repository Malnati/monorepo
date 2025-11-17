-- app/db/init/migrations/013_seed_transaction_contacts_comments.sql

-- Justificativa e rastreabilidade dos seeds de contato

-- Estes registros foram criados exclusivamente para ambientes de desenvolvimento, homologação e testes automatizados.
-- Os endereços dominio.com.br até user10@dominio.com.br são contas controladas para validação end-to-end da integração Gmail.
-- Números de WhatsApp são fictícios e seguem o formato brasileiro validado pelo regex existente.
-- Os dados não representam pessoas reais e não devem ser utilizados em ambiente de produção.
-- Referência: REQ-GMAIL-006 (Seeds de ambiente devem incluir contatos dominio.com.br)
-- Documentação: docs/rup/99-anexos/MVP/plano-integration-gmail.md seção 5 (Seeds dominio.com.br)
