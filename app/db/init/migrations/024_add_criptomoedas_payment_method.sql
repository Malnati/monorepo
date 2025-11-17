-- app/db/init/migrations/024_add_criptomoedas_payment_method.sql
-- Adicionar Criptomoedas como forma de pagamento

INSERT INTO tb_forma_pagamento (nome, ativo) VALUES
    ('Criptomoedas', true)
ON CONFLICT (nome) DO NOTHING;
