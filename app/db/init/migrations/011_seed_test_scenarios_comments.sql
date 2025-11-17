-- app/db/init/migrations/011_seed_test_scenarios_comments.sql
-- Comentários para os dados de teste de restrições de compra

COMMENT ON TABLE tb_user IS 
'Usuários autenticados via Google SSO. IDs 100-102 são reservados para testes de restrições de compra.';

COMMENT ON TABLE tb_transacao IS 
'Transações de compra/venda de lotes. Uma transação é criada quando um comprador adquire um lote de um fornecedor. IDs 1000-1001 são transações de teste.';
