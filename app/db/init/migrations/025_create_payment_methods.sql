-- app/db/init/migrations/021_create_payment_methods.sql
-- Criar tabelas de formas de pagamento

-- Tabela de domínio para formas de pagamento
CREATE TABLE IF NOT EXISTS tb_forma_pagamento (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    ativo BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de ligação entre lotes e formas de pagamento
CREATE TABLE IF NOT EXISTS tb_lote_forma_pagamento (
    lote_residuo_id INT NOT NULL REFERENCES tb_lote_residuo(id) ON DELETE CASCADE,
    forma_pagamento_id INT NOT NULL REFERENCES tb_forma_pagamento(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (lote_residuo_id, forma_pagamento_id)
);

-- Criar índice para consultas por lote
CREATE INDEX IF NOT EXISTS idx_lote_forma_pagamento_lote 
ON tb_lote_forma_pagamento(lote_residuo_id);

-- Criar índice para consultas por forma de pagamento
CREATE INDEX IF NOT EXISTS idx_lote_forma_pagamento_forma 
ON tb_lote_forma_pagamento(forma_pagamento_id);

-- Inserir formas de pagamento padrão
INSERT INTO tb_forma_pagamento (nome, ativo) VALUES
    ('PIX', true),
    ('Transferência bancária', true),
    ('Cartão de crédito', true),
    ('Boleto', true),
    ('Dinheiro na retirada', true),
    ('Criptomoedas', true)
ON CONFLICT (nome) DO NOTHING;
