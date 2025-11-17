-- app/db/init/migrations/030_create_payment_methods_tables.sql

-- ====================================================================
-- MIGRATION: Criar tabelas de formas de pagamento
-- Data: 2025-11-16
-- Descrição: Cria tabelas tb_forma_pagamento e tb_payment_method_offer
-- ====================================================================

-- Tabela de domínio para formas de pagamento
CREATE TABLE IF NOT EXISTS tb_forma_pagamento (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    ativo BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de ligação entre offers e formas de pagamento
CREATE TABLE IF NOT EXISTS tb_payment_method_offer (
    offer_id INT NOT NULL REFERENCES tb_offer(id) ON DELETE CASCADE,
    forma_pagamento_id INT NOT NULL REFERENCES tb_forma_pagamento(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (offer_id, forma_pagamento_id)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_payment_method_offer_offer 
ON tb_payment_method_offer(offer_id);

CREATE INDEX IF NOT EXISTS idx_payment_method_offer_forma 
ON tb_payment_method_offer(forma_pagamento_id);

-- Inserir formas de pagamento padrão
INSERT INTO tb_forma_pagamento (nome, ativo) VALUES
    ('PIX', true),
    ('Transferência bancária', true),
    ('Cartão de crédito', true),
    ('Boleto', true),
    ('Dinheiro na retirada', true),
    ('Criptomoedas', true)
ON CONFLICT (nome) DO NOTHING;

-- Comentários
COMMENT ON TABLE tb_forma_pagamento IS 'Formas de pagamento disponíveis no sistema';
COMMENT ON TABLE tb_payment_method_offer IS 'Relacionamento N:M entre offers e formas de pagamento';
COMMENT ON COLUMN tb_forma_pagamento.nome IS 'Nome da forma de pagamento';
COMMENT ON COLUMN tb_forma_pagamento.ativo IS 'Indica se a forma de pagamento está ativa';
COMMENT ON COLUMN tb_payment_method_offer.offer_id IS 'FK para tb_offer';
COMMENT ON COLUMN tb_payment_method_offer.forma_pagamento_id IS 'FK para tb_forma_pagamento';
